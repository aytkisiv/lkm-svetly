import { useEffect, useState } from 'react';
import { Trash2, Plus, Check, ImageOff } from 'lucide-react';
import { supabase, type DbCategory, type DbProduct } from '../../lib/supabase';
import { CATEGORIES } from '../../data/products';
import { btnGhost, btnDark, input } from './ui';

type Row = DbProduct & { dirty?: boolean };

export default function ProductsTab({
  cats,
  flash,
}: {
  cats: DbCategory[];
  flash: (t: string) => void;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [cat, setCat] = useState(cats[0]?.slug ?? '');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (cats.length && !cats.some((c) => c.slug === cat)) setCat(cats[0].slug);
  }, [cats]);

  async function load() {
    const { data, error } = await supabase!.from('products').select('*').order('sort');
    if (error) return flash('Не удалось загрузить: ' + error.message);
    setRows((data as DbProduct[]) || []);
  }

  async function save(row: Row) {
    if (!row.name.trim()) return flash('У товара должно быть название');
    setBusy(true);
    const { error } = await supabase!
      .from('products')
      .update({
        name: row.name.trim(),
        note: row.note?.trim() || null,
        price: row.price,
        photo: row.photo?.trim() || null,
      })
      .eq('id', row.id);
    setBusy(false);
    if (error) return flash('Ошибка сохранения: ' + error.message);
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, dirty: false } : r)));
    flash('Сохранено');
  }

  async function remove(row: Row) {
    if (!confirm(`Удалить «${row.name}»? Отменить будет нельзя.`)) return;
    setBusy(true);
    const { error } = await supabase!.from('products').delete().eq('id', row.id);
    setBusy(false);
    if (error) return flash('Ошибка удаления: ' + error.message);
    setRows((rs) => rs.filter((r) => r.id !== row.id));
    flash('Товар удалён');
  }

  async function add() {
    setBusy(true);
    const maxSort = Math.max(0, ...rows.filter((r) => r.category === cat).map((r) => r.sort));
    const { data, error } = await supabase!
      .from('products')
      .insert({ category: cat, name: 'Новый товар', price: 0, sort: maxSort + 1 })
      .select()
      .single();
    setBusy(false);
    if (error) return flash('Ошибка добавления: ' + error.message);
    setRows((rs) => [...rs, data as DbProduct]);
    flash('Впишите название и цену, затем сохраните');
  }

  async function seed() {
    if (!confirm('Загрузить в базу прайс из кода сайта? Делается один раз.')) return;
    setBusy(true);

    // Товар ссылается на группу внешним ключом, поэтому группы должны
    // оказаться в базе первыми. Заводим их сами, чтобы порядок вкладок
    // не имел значения.
    const { error: catsError } = await supabase!.from('categories').upsert(
      CATEGORIES.map((c, i) => ({
        slug: c.slug,
        name: c.name,
        descr: c.desc,
        photo: c.photo,
        sort: i,
      })),
      { onConflict: 'slug' }
    );
    if (catsError) {
      setBusy(false);
      return flash('Не удалось создать группы: ' + catsError.message);
    }

    const payload = CATEGORIES.flatMap((c) =>
      c.products.map((p, i) => ({
        category: c.slug,
        name: p.name,
        note: p.note ?? null,
        price: p.price,
        sort: i,
      }))
    );
    const { error } = await supabase!.from('products').insert(payload);
    setBusy(false);
    if (error) return flash('Ошибка импорта: ' + error.message);
    await load();
    flash(`Загружено позиций: ${payload.length}`);
  }

  const edit = (id: string, patch: Partial<DbProduct>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch, dirty: true } : r)));

  const visible = rows.filter((r) => r.category === cat);

  return (
    <>
      {rows.length === 0 && (
        <div className="rounded-3xl border border-[#e7e5e0] bg-white p-6 mb-8">
          <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
            База пустая. Можно перенести в неё прайс, который зашит в код сайта.
          </p>
          <button onClick={seed} disabled={busy} className={btnDark}>
            Импортировать прайс из кода
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {cats.map((c) => (
          <button
            key={c.slug}
            onClick={() => setCat(c.slug)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              c.slug === cat
                ? 'bg-[#e8501f] text-white'
                : 'bg-white border border-[#e7e5e0] text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
            }`}
          >
            {c.name}
            <span className="ml-2 opacity-60">
              {rows.filter((r) => r.category === c.slug).length}
            </span>
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-[#e7e5e0] bg-white overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_1fr_120px_170px] gap-3 px-5 py-3 border-b border-[#f0eeea] text-[11px] uppercase tracking-[0.18em] text-neutral-400">
          <span>Название</span>
          <span>Уточнение</span>
          <span>Цена, ₽/кг</span>
          <span />
        </div>

        {visible.map((row) => (
          <div key={row.id} className="px-5 py-3 border-b border-[#f0eeea] last:border-0">
            <div className="grid sm:grid-cols-[1fr_1fr_120px_170px] gap-3 items-center">
              <input
                value={row.name}
                onChange={(e) => edit(row.id, { name: e.target.value })}
                className={input}
              />
              <input
                value={row.note ?? ''}
                placeholder="—"
                onChange={(e) => edit(row.id, { note: e.target.value })}
                className={`${input} text-neutral-600 placeholder:text-neutral-300`}
              />
              <input
                type="number"
                min={0}
                value={row.price}
                onChange={(e) => edit(row.id, { price: Number(e.target.value) })}
                className={input}
              />
              <div className="flex items-center gap-2 justify-end">
                {row.dirty && (
                  <button onClick={() => save(row)} disabled={busy} className={btnDark}>
                    <Check className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                    Сохранить
                  </button>
                )}
                <button
                  onClick={() => remove(row)}
                  disabled={busy}
                  aria-label="Удалить"
                  className="p-2 text-neutral-300 hover:text-[#e8501f] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* фото для подсказки при наведении на позицию в прайсе на сайте */}
            <div className="flex items-center gap-3 mt-2">
              <div className="w-10 h-10 rounded-lg border border-[#e7e5e0] bg-[#f4f3ef] overflow-hidden shrink-0 flex items-center justify-center">
                {row.photo ? (
                  <img src={row.photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageOff className="w-4 h-4 text-neutral-300" />
                )}
              </div>
              <input
                value={row.photo ?? ''}
                placeholder="Ссылка на фото банки (необязательно)"
                onChange={(e) => edit(row.id, { photo: e.target.value })}
                className={`${input} text-[13px] text-neutral-500 placeholder:text-neutral-300`}
              />
            </div>
          </div>
        ))}

        {visible.length === 0 && rows.length > 0 && (
          <p className="text-sm text-neutral-400 px-5 py-6">В этой группе пока нет товаров.</p>
        )}
      </div>

      <button
        onClick={add}
        disabled={busy || !cat}
        className={`${btnGhost} mt-6 inline-flex items-center gap-2`}
      >
        <Plus className="w-4 h-4" /> Добавить товар
      </button>
    </>
  );
}
