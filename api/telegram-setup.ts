import { SITE, tg, token, webhookSecret } from './_tg';

export const config = { runtime: 'edge' };

/**
 * Разовая настройка бота: подписка на обновления, список команд и кнопка «Меню».
 * Открывается в браузере. Ничего секретного не возвращает и может только
 * привязать бота к нашему же сайту, поэтому отдельная защита не нужна.
 */
export default async function handler(): Promise<Response> {
  if (!token()) {
    return new Response('TELEGRAM_BOT_TOKEN не задан', { status: 500 });
  }

  const secret = await webhookSecret();

  const hook = await tg('setWebhook', {
    url: `${SITE}/api/telegram`,
    secret_token: secret,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: true,
  });

  await tg('setMyCommands', {
    commands: [
      { command: 'menu', description: 'Главное меню' },
      { command: 'price', description: 'Прайс по категориям' },
      { command: 'search', description: 'Найти товар' },
    ],
  });

  await tg('setChatMenuButton', { menu_button: { type: 'commands' } });

  const info = await (await fetch(`https://api.telegram.org/bot${token()}/getWebhookInfo`)).json();

  return new Response(
    `Настройка ${hook.ok ? 'выполнена' : 'не удалась'}.\n\n` +
      JSON.stringify(info, null, 2) +
      '\n\nТеперь напишите боту /menu.',
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  );
}
