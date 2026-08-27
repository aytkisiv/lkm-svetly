import { useEffect, useState } from 'react';
import { Trash2, Plus, Check, ImagePlus, Loader2, X } from 'lucide-react';
import { supabase, type DbCategory, type DbProduct } from '../../lib/supabase';
import { CATEGORIES } from '../../data/products';
import { btnGhost, btnDark, input } from './ui';

const PHOTO_BUCKET = 'product-photos';
const MAX_PHOTO_MB = 5;

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
  const [uploadingId, setUploadingId] = useState<string | null>(null);

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
        description: row.description?.trim() || null,
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

  // Фото сохраняется сразу по факту загрузки, отдельно от остальных полей:
  // иначе легко подумать, что раз нажал «Сохранить» на имени — фото тоже ушло.
  async function uploadPhoto(row: Row, file: File) {
    if (!file.type.startsWith('image/')) {
      return flash('Нужен файл изображения — jpg, png или webp');
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      return flash(`Файл больше ${MAX_PHOTO_MB} МБ — выберите фото поменьше`);
    }

    setUploadingId(row.id);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${row.id}-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase!.storage
      .from(PHOTO_BUCKET)
      .upload(path, file, { upsert: true, cacheControl: '31536000' });
    if (upErr) {
      setUploadingId(null);
      return flash('Не удалось загрузить фото: ' + upErr.message);
    }

    const { data } = supabase!.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    const { error } = await supabase!
      .from('products')
      .update({ photo: data.publicUrl })
      .eq('id', row.id);
    setUploadingId(null);
    if (error) return flash('Фото загрузилось, но не сохранилось: ' + error.message);

    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, photo: data.publicUrl } : r)));
    flash('Фото сохранено');
  }

  async function removePhoto(row: Row) {
    setUploadingId(row.id);
    const { error } = await supabase!.from('products').update({ photo: null }).eq('id', row.id);
    setUploadingId(null);
    if (error) return flash('Не удалось убрать фото: ' + error.message);
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, photo: null } : r)));
    flash('Фото убрано');
  }

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
            <div className="flex items-center gap-3 mt-3">
              <label
                className={`group relative flex items-center gap-3 ${
                  uploadingId === row.id ? 'pointer-events-none' : 'cursor-pointer'
                }`}
              >
                <div className="w-14 h-14 rounded-xl border-2 border-dashed border-[#e7e5e0] group-hover:border-[#e8501f] bg-[#f4f3ef] overflow-hidden shrink-0 flex items-center justify-center transition-colors">
                  {uploadingId === row.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                  ) : row.photo ? (
                    <img src={row.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImagePlus className="w-5 h-5 text-neutral-300 group-hover:text-[#e8501f] transition-colors" />
                  )}
                </div>
                <span className="text-sm text-neutral-500 group-hover:text-neutral-900 transition-colors">
                  {row.photo ? 'Заменить фото' : 'Добавить фото банки'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingId === row.id}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (file) uploadPhoto(row, file);
                  }}
                />
              </label>
              {row.photo && uploadingId !== row.id && (
                <button
                  onClick={() => removePhoto(row)}
                  aria-label="Убрать фото"
                  className="p-1.5 text-neutral-300 hover:text-[#e8501f] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* описание: свойства и нюансы применения — видно на сайте по клику на товар */}
            <textarea
              value={row.description ?? ''}
              placeholder="Описание — свойства и нюансы применения (необязательно)"
              rows={2}
              onChange={(e) => edit(row.id, { description: e.target.value })}
              className={`${input} mt-3 resize-y placeholder:text-neutral-300`}
            />
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
