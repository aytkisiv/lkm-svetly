import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * null, если ключи не заданы — тогда сайт живёт на встроенном прайсе,
 * а админка честно скажет, что база не подключена.
 */
export const supabase = url && key ? createClient(url, key) : null;

export type DbCategory = {
  slug: string;
  name: string;
  descr: string;
  photo: string;
  sort: number;
};

export type DbOrder = {
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

export type DbProduct = {
  id: string;
  category: string;
  name: string;
  note: string | null;
  price: number;
  photo: string | null;
  sort: number;
};
