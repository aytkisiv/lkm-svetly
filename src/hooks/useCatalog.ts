import { useEffect, useState } from 'react';
import { CATEGORIES, type ProductCategory } from '../data/products';
import { supabase } from '../lib/supabase';

/**
 * Каталог из базы. Если база не подключена, недоступна или в ней нет товаров —
 * возвращаем встроенный каталог из кода: пустой прайс посетитель
 * не увидит ни при каких обстоятельствах.
 */
export function useCatalog(): ProductCategory[] {
  const [categories, setCategories] = useState<ProductCategory[]>(CATEGORIES);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;

    (async () => {
      const [cats, prods] = await Promise.all([
        supabase.from('categories').select('slug,name,descr,photo,sort').order('sort'),
        supabase.from('products').select('category,name,note,price,photo,sort').order('sort'),
      ]);
      if (!alive || prods.error || !prods.data?.length) return;

      // группы берём из базы, если они там заведены, иначе оставляем встроенные
      const base: ProductCategory[] = cats.data?.length
        ? cats.data.map((c) => ({
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
          products: prods.data
            .filter((p) => p.category === c.slug)
            .map((p) => ({
              name: p.name,
              note: p.note ?? undefined,
              price: p.price,
              photo: p.photo ?? undefined,
            })),
        }))
      );
    })();

    return () => {
      alive = false;
    };
  }, []);

  return categories;
}
