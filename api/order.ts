import { sbAdmin } from './_tg';

export const config = { runtime: 'edge' };

type Payload = {
  product?: string;
  name?: string;
  email?: string;
  phone?: string;
  comment?: string;
  hp?: string; // honeypot: люди его не видят, боты заполняют
};

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const line = (icon: string, label: string, value?: string) =>
  value && value.trim() ? `${icon} <b>${label}:</b> ${esc(value.trim())}\n` : '';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = (process.env.TELEGRAM_CHAT_ID || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (!token || chatIds.length === 0) {
    return json({ error: 'Telegram is not configured' }, 500);
  }

  let data: Payload;
  try {
    data = (await req.json()) as Payload;
  } catch {
    return json({ error: 'Bad request' }, 400);
  }

  // ловушка для ботов: заполнено — молча делаем вид, что всё хорошо
  if (data.hp) return json({ ok: true });

  const name = (data.name || '').trim();
  const phone = (data.phone || '').trim();
  if (name.length < 2) {
    return json({ error: 'Укажите ваше имя' }, 400);
  }
  if (phone.replace(/\D/g, '').length < 10) {
    return json({ error: 'Проверьте номер телефона — не хватает цифр' }, 400);
  }

  // сохраняем заявку в базу — из неё бот показывает раздел «Клиенты».
  // Если хранилище не настроено или недоступно, заявка всё равно уйдёт в чат:
  // потерять обращение клиента из-за проблем с базой недопустимо.
  let orderId = '';
  try {
    const res = await sbAdmin('orders', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        product: data.product?.trim() || null,
        name,
        phone,
        email: data.email?.trim() || null,
        comment: data.comment?.trim() || null,
      }),
    });
    if (res?.ok) {
      const [row] = (await res.json()) as { id: string }[];
      orderId = row?.id || '';
    } else if (res) {
      console.error('Не удалось сохранить заявку:', await res.text());
    }
  } catch (e) {
    console.error('Ошибка записи заявки:', e);
  }

  const time = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Asia/Yekaterinburg',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  const text =
    `🔔 <b>Новая заявка с сайта</b>\n\n` +
    line('📦', 'Позиция', data.product) +
    line('👤', 'Имя', name) +
    line('📞', 'Телефон', phone) +
    line('✉️', 'Email', data.email) +
    line('💬', 'Комментарий', data.comment) +
    `\n🕐 ${time} (Екатеринбург)`;

  // кнопки: написать в WhatsApp и скопировать номер одним касанием
  const digits = phone.replace(/\D/g, '').replace(/^8/, '7');
  const keyboard: unknown[][] = [];
  if (digits.length >= 11) {
    keyboard.push([{ text: '💬 Написать в WhatsApp', url: `https://wa.me/${digits}` }]);
  }
  keyboard.push([{ text: '📋 Скопировать телефон', copy_text: { text: phone } }]);
  keyboard.push([
    { text: '✅ Взял в работу', callback_data: orderId ? 'take:' + orderId : 'take' },
  ]);

  const results = await Promise.all(
    chatIds.map(async (chat_id) => {
      const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id,
          text,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: keyboard },
          disable_web_page_preview: true,
        }),
      });
      const body = (await r.json().catch(() => ({}))) as { description?: string };
      if (!r.ok) console.error('Telegram error:', r.status, body.description);
      return { ok: r.ok, description: body.description };
    })
  );

  if (!results.some((r) => r.ok)) {
    // подробности пишем в логи Vercel, наружу их не отдаём
    return json({ error: 'Не удалось отправить заявку' }, 502);
  }
  return json({ ok: true });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
