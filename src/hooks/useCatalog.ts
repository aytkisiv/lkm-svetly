import { useEffect, useState } from 'react';
import { CATEGORIES, type ProductCategory } from '../data/products';

const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

type DbCat = { slug: string; name: string; descr: string; photo: string; sort: number };
type DbProd = {
  category: string;
  name: string;
  note: string | null;
  price: number;
  photo: string | null;
  sort: number;
};

/**
 * Читаем прайс обычным fetch, а не клиентом supabase-js: библиотека весит
 * около 220 КБ и тянула бы за собой весь основной файл сайта. Публичному
 * каталогу нужны всего два GET-запроса, ради них её грузить незачем —
 * в админке она по-прежнему используется.
 */
async function loadFromDb(signal: AbortSignal) {
  if (!URL_ || !KEY) return null;
  const h = { apikey: KEY, Authorization: `Bearer ${KEY}` };
  const get = async <T>(path: string): Promise<T[] | null> => {
    const r = await fetch(`${URL_}/rest/v1/${path}`, { headers: h, signal });
    return r.ok ? ((await r.json()) as T[]) : null;
  };
  const [cats, prods] = await Promise.all([
    get<DbCat>('categories?select=slug,name,descr,photo,sort&order=sort'),
    get<DbProd>('products?select=category,name,note,price,photo,sort&order=sort'),
  ]);
  return prods?.length ? { cats, prods } : null;
}

/**
 * Каталог из базы. Если база не подключена, недоступна или в ней нет товаров —
 * возвращаем встроенный каталог из кода: пустой прайс посетитель
 * не увидит ни при каких обстоятельствах.
 */
export function useCatalog(): ProductCategory[] {
  const [categories, setCategories] = useState<ProductCategory[]>(CATEGORIES);

  useEffect(() => {
    const ctrl = new AbortController();

    loadFromDb(ctrl.signal)
      .then((data) => {
        if (!data) return;
        const { cats, prods } = data;

        // группы берём из базы, если они там заведены, иначе оставляем встроенные
        const base: ProductCategory[] = cats?.length
          ? cats.map((c) => ({
              slug: c.slug,
              name: c.name,
              desc: c.descr || '',
              photo:
                c.photo || CATEGORIES.find((s) => s.slug === c.slug)?.photo || CATEGORIES[0].photo,
              products: [],
            }))
          : CATEGORIES;

        setCategories(
          base.map((c) => ({
            ...c,
            products: prods
              .filter((p) => p.category === c.slug)
              .map((p) => ({
                name: p.name,
                note: p.note ?? undefined,
                price: p.price,
                photo: p.photo ?? undefined,
              })),
          }))
        );
      })
      .catch(() => {
        // база недоступна — на экране уже показан прайс из кода, всё в порядке
      });

    return () => ctrl.abort();
  }, []);

  return categories;
}
