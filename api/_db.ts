// Общее для serverless-функций сайта.

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
