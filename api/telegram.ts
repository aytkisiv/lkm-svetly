import {
  BTN,
  CATS,
  KEYBOARD,
  SITE,
  allowedChats,
  esc,
  fetchProducts,
  fmtOrder,
  sbAdmin,
  tg,
  webhookSecret,
  type Item,
  type Order,
} from './_tg';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  // Telegram шлёт секрет заголовком — так посторонний не сможет дёргать бота
  const secret = await webhookSecret();
  if (req.headers.get('x-telegram-bot-api-secret-token') !== secret) {
    return new Response('forbidden', { status: 403 });
  }

  const update = (await req.json().catch(() => ({}))) as any;

  if (update.callback_query) await onCallback(update.callback_query);
  else if (update.message?.text) await onMessage(update.message);

  // Telegram всегда ждёт 200, иначе будет слать обновление повторно
  return new Response('ok');
}

function allowed(chatId: number | string) {
  const list = allowedChats();
  return list.length === 0 || list.includes(String(chatId));
}

async function onMessage(msg: any) {
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();

  if (!allowed(chatId)) {
    await tg('sendMessage', {
      chat_id: chatId,
      text: 'Этот бот только для сотрудников ЛКМ СНАБ.',
    });
    return;
  }

  if (text === '/start' || text === '/menu') return sendMenu(chatId, msg.from?.first_name);
  if (text === BTN.price || text === '/price') return sendCategories(chatId);
  if (text === BTN.search || text === '/search')
    return void tg('sendMessage', {
      chat_id: chatId,
      text: 'Напишите название или его часть — найду позицию и цену.\n\nНапример: <code>армокот</code>',
      parse_mode: 'HTML',
    });
  if (text === BTN.clients || text === '/clients') return sendOrders(chatId, 'all');
  if (text === BTN.stats || text === '/stats') return sendStats(chatId);
  if (text === BTN.admin)
    return void tg('sendMessage', {
      chat_id: chatId,
      text: `Управление прайсом: ${SITE}/admin`,
      reply_markup: KEYBOARD,
    });

  if (text.startsWith('/')) return sendMenu(chatId, msg.from?.first_name);

  return search(chatId, text);
}

async function sendMenu(chatId: number, name?: string) {
  await tg('sendMessage', {
    chat_id: chatId,
    parse_mode: 'HTML',
    text:
      `<b>ЛКМ СНАБ — бот отдела продаж</b>\n\n` +
      (name ? `Здравствуйте, ${esc(name)}!\n\n` : '') +
      `Сюда падают заявки с сайта. Ещё умею:\n\n` +
      `📋 <b>Прайс</b> — цены по категориям\n` +
      `🔍 <b>Найти товар</b> — просто напишите название\n` +
      `👥 <b>Клиенты</b> — все заявки с сайта\n` +
      `⚙️ <b>Админка</b> — изменить цены и состав прайса\n\n` +
      `Кнопки закреплены внизу экрана.\nСайт: ${SITE}`,
    reply_markup: KEYBOARD,
  });
}

async function sendCategories(chatId: number) {
  await tg('sendMessage', {
    chat_id: chatId,
    text: 'Выберите категорию:',
    reply_markup: {
      inline_keyboard: CATS.map((c) => [{ text: c.name, callback_data: 'cat:' + c.slug }]),
    },
  });
}

function fmt(items: Item[]) {
  return items
    .map((p) => `• <b>${esc(p.name)}</b> — ${p.price} ₽/кг${p.note ? `\n  <i>${esc(p.note)}</i>` : ''}`)
    .join('\n');
}

async function search(chatId: number, query: string) {
  const q = query.toLowerCase();
  const all = await fetchProducts();
  if (all.length === 0) {
    await tg('sendMessage', { chat_id: chatId, text: 'Не удалось получить прайс. Попробуйте позже.' });
    return;
  }
  const found = all.filter(
    (p) => p.name.toLowerCase().includes(q) || (p.note || '').toLowerCase().includes(q)
  );
  if (found.length === 0) {
    await tg('sendMessage', {
      chat_id: chatId,
      parse_mode: 'HTML',
      text: `По запросу «${esc(query)}» ничего не нашлось.\n\nПопробуйте часть названия — например, <code>виникор</code>.`,
    });
    return;
  }
  await tg('sendMessage', {
    chat_id: chatId,
    parse_mode: 'HTML',
    text: `<b>Найдено: ${found.length}</b>\n\n${fmt(found.slice(0, 25))}`,
  });
}

const FILTERS: Record<string, { title: string; query: string }> = {
  all: { title: 'Последние заявки', query: 'order=created_at.desc&limit=10' },
  new: { title: 'Новые заявки', query: 'status=eq.new&order=created_at.desc&limit=10' },
  in_work: { title: 'Заявки в работе', query: 'status=eq.in_work&order=created_at.desc&limit=10' },
};

async function sendOrders(chatId: number, filter: string, messageId?: number) {
  const f = FILTERS[filter] || FILTERS.all;
  const res = await sbAdmin(`orders?select=*&${f.query}`);

  if (!res) {
    await tg('sendMessage', {
      chat_id: chatId,
      text: 'Хранение заявок не настроено: не задан служебный ключ базы.',
    });
    return;
  }
  if (!res.ok) {
    await tg('sendMessage', { chat_id: chatId, text: 'Не удалось получить заявки.' });
    return;
  }

  const orders = (await res.json()) as Order[];
  const text = orders.length
    ? `<b>${f.title} — ${orders.length}</b>\n\n` +
      orders.map((o, i) => `<b>${i + 1}.</b> ${fmtOrder(o)}`).join('\n\n')
    : `<b>${f.title}</b>\n\nПока пусто.`;

  // цифры под списком открывают карточку клиента
  const numbers = orders.map((o, i) => ({ text: String(i + 1), callback_data: 'ord:' + o.id }));
  const rows: unknown[][] = [];
  for (let i = 0; i < numbers.length; i += 5) rows.push(numbers.slice(i, i + 5));
  rows.push([
    { text: '🆕 Новые', callback_data: 'list:new' },
    { text: '⏳ В работе', callback_data: 'list:in_work' },
    { text: '🔄 Все', callback_data: 'list:all' },
  ]);

  const payload = {
    chat_id: chatId,
    parse_mode: 'HTML',
    text,
    reply_markup: { inline_keyboard: rows },
  };
  if (messageId) await tg('editMessageText', { ...payload, message_id: messageId });
  else await tg('sendMessage', payload);
}

async function sendStats(chatId: number) {
  const res = await sbAdmin('orders?select=product,status,created_at');
  if (!res) {
    await tg('sendMessage', {
      chat_id: chatId,
      text: 'Хранение заявок не настроено: не задан служебный ключ базы.',
    });
    return;
  }
  const all = (await res.json()) as Order[];
  const now = Date.now();
  const since = (d: number) => all.filter((o) => now - +new Date(o.created_at) < d * 86400000).length;
  const cnt = (s: string) => all.filter((o) => o.status === s).length;

  const top = Object.entries(
    all.reduce<Record<string, number>>((a, o) => {
      const k = o.product?.trim();
      if (k) a[k] = (a[k] || 0) + 1;
      return a;
    }, {})
  )
    .sort((x, y) => y[1] - x[1])
    .slice(0, 5);

  await tg('sendMessage', {
    chat_id: chatId,
    parse_mode: 'HTML',
    text:
      `<b>📊 Сводка по заявкам</b>\n\n` +
      `За сутки: <b>${since(1)}</b>\nЗа неделю: <b>${since(7)}</b>\n` +
      `За месяц: <b>${since(30)}</b>\nВсего: <b>${all.length}</b>\n\n` +
      `🆕 Не взяты: <b>${cnt('new')}</b>\n⏳ В работе: <b>${cnt('in_work')}</b>\n` +
      `✅ Завершены: <b>${cnt('done')}</b>` +
      (top.length
        ? `\n\n<b>Чаще всего спрашивают:</b>\n` +
          top.map(([n, c], i) => `${i + 1}. ${esc(n)} — ${c}`).join('\n')
        : ''),
  });
}

async function sendOrderCard(chatId: number, id: string) {
  const res = await sbAdmin(`orders?select=*&id=eq.${id}`);
  if (!res || !res.ok) return;
  const [o] = (await res.json()) as Order[];
  if (!o) return;

  const digits = o.phone.replace(/\D/g, '').replace(/^8/, '7');
  const rows: unknown[][] = [];
  if (digits.length >= 11)
    rows.push([{ text: '💬 Написать в WhatsApp', url: `https://wa.me/${digits}` }]);
  rows.push([{ text: '📋 Скопировать телефон', copy_text: { text: o.phone } }]);
  if (o.status !== 'done') rows.push([{ text: '✅ Завершить', callback_data: 'done:' + o.id }]);
  rows.push([{ text: '← К списку', callback_data: 'list:all' }]);

  await tg('sendMessage', {
    chat_id: chatId,
    parse_mode: 'HTML',
    text: `<b>Карточка клиента</b>\n\n${fmtOrder(o)}` + (o.email ? `\n✉️ ${esc(o.email)}` : ''),
    reply_markup: { inline_keyboard: rows },
  });
}

async function setStatus(id: string, status: string, who?: string) {
  await sbAdmin(`orders?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, taken_by: who ?? null }),
  });
}

async function onCallback(cb: any) {
  const chatId = cb.message?.chat?.id;
  const data: string = cb.data || '';

  if (!allowed(chatId)) {
    await tg('answerCallbackQuery', { callback_query_id: cb.id, text: 'Нет доступа' });
    return;
  }

  if (data.startsWith('cat:')) {
    const slug = data.slice(4);
    const cat = CATS.find((c) => c.slug === slug);
    const items = (await fetchProducts()).filter((p) => p.category === slug);
    await tg('answerCallbackQuery', { callback_query_id: cb.id });
    await tg('sendMessage', {
      chat_id: chatId,
      parse_mode: 'HTML',
      text: items.length
        ? `<b>${cat?.name} — ${items.length} позиций</b>\n\n${fmt(items)}`
        : `В категории «${cat?.name}» пока нет позиций.`,
    });
    return;
  }

  if (data.startsWith('list:')) {
    await tg('answerCallbackQuery', { callback_query_id: cb.id });
    await sendOrders(chatId, data.slice(5), cb.message.message_id);
    return;
  }

  if (data.startsWith('ord:')) {
    await tg('answerCallbackQuery', { callback_query_id: cb.id });
    await sendOrderCard(chatId, data.slice(4));
    return;
  }

  if (data.startsWith('done:')) {
    await setStatus(data.slice(5), 'done');
    await tg('answerCallbackQuery', { callback_query_id: cb.id, text: 'Заявка завершена' });
    await sendOrderCard(chatId, data.slice(5));
    return;
  }

  // «Взял в работу» на заявке: отмечаем прямо в сообщении
  if (data === 'take' || data.startsWith('take:')) {
    const who = [cb.from?.first_name, cb.from?.last_name].filter(Boolean).join(' ') || 'менеджер';
    if (data.startsWith('take:')) await setStatus(data.slice(5), 'in_work', who);
    const rows: any[][] = cb.message?.reply_markup?.inline_keyboard || [];
    const kept = rows.filter(
      (row) => !row.some((b: any) => String(b.callback_data || '').startsWith('take'))
    );
    kept.push([{ text: `✅ В работе: ${who}`, callback_data: 'noop' }]);
    await tg('answerCallbackQuery', { callback_query_id: cb.id, text: 'Отмечено' });
    await tg('editMessageReplyMarkup', {
      chat_id: chatId,
      message_id: cb.message.message_id,
      reply_markup: { inline_keyboard: kept },
    });
    return;
  }

  await tg('answerCallbackQuery', { callback_query_id: cb.id });
}
