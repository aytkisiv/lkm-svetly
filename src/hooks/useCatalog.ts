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
  description: string | null;
  sort: number;
};

/**
 * Читаем прайс обычным fetch, а не клиентом supabase-js: библиотека весит
 * около 220 КБ и тянула бы за собой весь основной файл сайта. Публичному
 * каталогу нужны всего два GET-запроса, ради них её грузить незачем —
 * в админке она по-прежнему используется.
 */
const PAGE = 30;

/**
 * Весь прайс одним запросом — это ~35 КБ даже сжатым: у части провайдеров
 * РФ такая передача обрывается на середине (та же причина, по которой раньше
 * дробили JS-бандл на чанки). Тянем страницами по PAGE строк — каждая
 * заведомо укладывается в размер, который проходит целиком.
 */
async function fetchAll<T>(path: string, signal: AbortSignal): Promise<T[]> {
  const h = { apikey: KEY!, Authorization: `Bearer ${KEY}` };
  const out: T[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const r = await fetch(`${URL_}/rest/v1/${path}&limit=${PAGE}&offset=${offset}`, {
      headers: h,
      signal,
    });
    if (!r.ok) throw new Error(`db fetch failed: ${path}`);
    const chunk = (await r.json()) as T[];
    out.push(...chunk);
    if (chunk.length < PAGE) return out;
  }
}

async function loadFromDb(signal: AbortSignal) {
  if (!URL_ || !KEY) return null;
  const [cats, prods] = await Promise.all([
    fetchAll<DbCat>('categories?select=slug,name,descr,photo,sort&order=sort', signal),
    fetchAll<DbProd>(
      'products?select=category,name,note,price,photo,description,sort&order=sort',
      signal
    ),
  ]);
  return prods.length ? { cats, prods } : null;
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
                description: p.description ?? undefined,
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
