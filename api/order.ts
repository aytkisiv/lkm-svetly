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

/**
 * Вёрстка письма — таблицами и инлайн-стилями: почтовые клиенты (особенно
 * Outlook) игнорируют <style> и flex/grid, поэтому обычный CSS тут не работает.
 */
function row(label: string, value: string | undefined, first = false) {
  if (!value?.trim()) return '';
  return `
    <tr>
      <td style="padding:${first ? '0' : '14px'} 0 0;border-top:${first ? 'none' : '1px solid #f0eeea'};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="110" style="padding:${first ? '0' : '14px'} 12px 0 0;font-size:12px;color:#9a9890;white-space:nowrap;vertical-align:top;">
              ${label}
            </td>
            <td style="padding:${first ? '0' : '14px'} 0 0;font-size:15px;color:#141414;font-weight:600;">
              ${esc(value.trim())}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function buildEmail(opts: {
  name: string;
  phone: string;
  product?: string;
  email?: string;
  comment?: string;
  time: string;
}) {
  const digits = opts.phone.replace(/\D/g, '').replace(/^8/, '7');
  return `<!doctype html>
<html lang="ru">
  <body style="margin:0;padding:24px 12px;background:#f4f3ef;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="560" style="max-width:560px;width:100%;" cellpadding="0" cellspacing="0">

            <tr>
              <td style="padding:0 4px 16px;">
                <span style="font-size:15px;font-weight:700;letter-spacing:0.02em;color:#141414;">
                  ЛКМ СНАБ<span style="color:#e8501f;">.</span>
                </span>
              </td>
            </tr>

            <tr>
              <td style="background:#141414;border-radius:20px 20px 0 0;padding:22px 28px;">
                <span style="display:inline-block;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#e8501f;font-weight:600;">
                  Новая заявка с сайта
                </span>
                <div style="margin-top:6px;font-size:20px;font-weight:700;color:#ffffff;">
                  ${esc(opts.name)}
                </div>
              </td>
            </tr>

            <tr>
              <td style="background:#ffffff;border:1px solid #e7e5e0;border-top:none;padding:24px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${row('Телефон', opts.phone, true)}
                  ${row('Позиция', opts.product)}
                  ${row('Email', opts.email)}
                  ${row('Комментарий', opts.comment)}
                </table>

                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px;">
                  <tr>
                    <td style="border-radius:999px;background:#e8501f;">
                      <a href="tel:+${digits}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">
                        Позвонить
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="background:#ffffff;border:1px solid #e7e5e0;border-top:1px solid #f0eeea;border-radius:0 0 20px 20px;padding:14px 28px;">
                <span style="font-size:12px;color:#9a9890;">
                  ${opts.time} (Екатеринбург) · заявка сохранена в <span style="color:#141414;">/admin</span>
                </span>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

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

  const html = buildEmail({
    name,
    phone,
    product: data.product,
    email: data.email,
    comment: data.comment,
    time,
  });

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
