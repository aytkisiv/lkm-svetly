import { sbAdmin } from './_db';

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

const row = (label: string, value?: string) =>
  value && value.trim()
    ? `<tr><td style="padding:4px 12px 4px 0;color:#8a8a8a;white-space:nowrap;">${label}</td><td style="padding:4px 0;"><b>${esc(value.trim())}</b></td></tr>`
    : '';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const resendKey = process.env.RESEND_API_KEY;
  const to = (process.env.ORDERS_EMAIL_TO || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (!resendKey || to.length === 0) {
    return json({ error: 'Email is not configured' }, 500);
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

  // сохраняем заявку в базу — из неё считается «Сводка» в админке.
  // Если хранилище не настроено или недоступно, письмо всё равно уйдёт:
  // потерять обращение клиента из-за проблем с базой недопустимо.
  try {
    const res = await sbAdmin('orders', {
      method: 'POST',
      body: JSON.stringify({
        product: data.product?.trim() || null,
        name,
        phone,
        email: data.email?.trim() || null,
        comment: data.comment?.trim() || null,
      }),
    });
    if (res && !res.ok) console.error('Не удалось сохранить заявку:', await res.text());
  } catch (e) {
    console.error('Ошибка записи заявки:', e);
  }

  const time = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Asia/Yekaterinburg',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());

  const html =
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#141414;">` +
    `<h2 style="margin:0 0 16px;">Новая заявка с сайта ЛКМ СНАБ</h2>` +
    `<table cellpadding="0" cellspacing="0">` +
    row('Позиция', data.product) +
    row('Имя', name) +
    row('Телефон', phone) +
    row('Email', data.email) +
    row('Комментарий', data.comment) +
    `</table>` +
    `<p style="margin-top:16px;color:#8a8a8a;">${time} (Екатеринбург)</p>` +
    `</div>`;

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.ORDERS_EMAIL_FROM || 'ЛКМ СНАБ <onboarding@resend.dev>',
      to,
      reply_to: data.email?.trim() || undefined,
      subject: `Заявка с сайта — ${name}`,
      html,
    }),
  });

  if (!r.ok) {
    // подробности — в логи Vercel, наружу их не отдаём
    console.error('Resend error:', r.status, await r.text().catch(() => ''));
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
