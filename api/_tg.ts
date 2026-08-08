// Общее для обработчиков бота.

export const SITE = 'https://lkm-svetly.vercel.app';

export const CATS = [
  { slug: 'gruntemal', name: 'Грунт-эмаль' },
  { slug: 'grunt', name: 'Грунт' },
  { slug: 'emal', name: 'Эмаль' },
  { slug: 'mastika', name: 'Мастика' },
];

export const BTN = {
  price: '📋 Прайс',
  search: '🔍 Найти товар',
  clients: '👥 Клиенты',
  stats: '📊 Сводка',
  admin: '⚙️ Админка',
};

/** Закреплённая клавиатура под полем ввода. */
export const KEYBOARD = {
  keyboard: [
    [{ text: BTN.price }, { text: BTN.search }],
    [{ text: BTN.clients }, { text: BTN.stats }],
    [{ text: BTN.admin }],
  ],
  resize_keyboard: true,
  is_persistent: true,
};

export const token = () => process.env.TELEGRAM_BOT_TOKEN || '';

export const allowedChats = () =>
  (process.env.TELEGRAM_CHAT_ID || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export async function tg(method: string, body: unknown) {
  const r = await fetch(`https://api.telegram.org/bot${token()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) console.error('TG', method, await r.text());
  return r;
}

/**
 * Секрет для проверки, что запрос действительно от Telegram.
 * Считается из токена бота — отдельную переменную заводить не нужно.
 */
export async function webhookSecret() {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('lkm:' + token()));
  return Array.from(new Uint8Array(buf))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export type Item = { name: string; note: string | null; price: number; category: string };

export type Order = {
  id: string;
  product: string | null;
  name: string;
  phone: string;
  email: string | null;
  comment: string | null;
  status: 'new' | 'in_work' | 'done';
  taken_by: string | null;
  created_at: string;
};

/**
 * Запросы к таблице заявок идут служебным ключом: в ней персональные данные
 * клиентов, и публичному ключу с сайта доступ к ней закрыт полностью.
 */
export async function sbAdmin(path: string, init: RequestInit = {}) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

export const STATUS: Record<string, string> = {
  new: '🆕 новая',
  in_work: '⏳ в работе',
  done: '✅ завершена',
};

export function when(iso: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Asia/Yekaterinburg',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function fmtOrder(o: Order) {
  return (
    `👤 <b>${esc(o.name)}</b> · <code>${esc(o.phone)}</code>\n` +
    (o.product ? `📦 ${esc(o.product)}\n` : '') +
    (o.comment ? `💬 <i>${esc(o.comment)}</i>\n` : '') +
    `🕐 ${when(o.created_at)} · ${STATUS[o.status] || o.status}` +
    (o.taken_by ? ` (${esc(o.taken_by)})` : '')
  );
}

export async function fetchProducts(): Promise<Item[]> {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const r = await fetch(
    `${url}/rest/v1/products?select=name,note,price,category&order=category,sort`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  if (!r.ok) return [];
  return (await r.json()) as Item[];
}
