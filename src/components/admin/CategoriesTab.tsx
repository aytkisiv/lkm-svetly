import { useState } from 'react';
import { Trash2, Plus, Check, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase, type DbCategory } from '../../lib/supabase';
import { CATEGORIES } from '../../data/products';
import { btnGhost, btnDark, input, Label } from './ui';

const STOCK_PHOTOS = CATEGORIES.map((c) => ({ src: c.photo, name: c.name }));

type Row = DbCategory & { dirty?: boolean };

export default function CategoriesTab({
  cats,
  reload,
  flash,
}: {
  cats: DbCategory[];
  reload: () => Promise<void>;
  flash: (t: string) => void;
}) {
  const [rows, setRows] = useState<Row[]>(cats);
  const [busy, setBusy] = useState(false);

  const edit = (slug: string, patch: Partial<DbCategory>) =>
    setRows((rs) => rs.map((r) => (r.slug === slug ? { ...r, ...patch, dirty: true } : r)));

  async function save(row: Row) {
    if (!row.name.trim()) return flash('У группы должно быть название');
    setBusy(true);
    const { error } = await supabase!
      .from('categories')
      .upsert({
        slug: row.slug,
        name: row.name.trim(),
        descr: row.descr?.trim() || '',
        photo: row.photo || '',
        sort: row.sort,
      })
      .eq('slug', row.slug);
    setBusy(false);
    if (error) return flash('Ошибка сохранения: ' + error.message);
    setRows((rs) => rs.map((r) => (r.slug === row.slug ? { ...r, dirty: false } : r)));
    await reload();
    flash('Сохранено');
  }

  async function remove(row: Row) {
    const { count } = await supabase!
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category', row.slug);

    if (count && count > 0) {
      return flash(`Сначала перенесите или удалите товары этой группы (${count} шт.)`);
    }
    if (!confirm(`Удалить группу «${row.name}»?`)) return;
    setBusy(true);
    const { error } = await supabase!.from('categories').delete().eq('slug', row.slug);
    setBusy(false);
    if (error) return flash('Ошибка удаления: ' + error.message);
    await reload();
    setRows((rs) => rs.filter((r) => r.slug !== row.slug));
    flash('Группа удалена');
  }

  async function move(row: Row, dir: -1 | 1) {
    const sorted = [...rows].sort((a, b) => a.sort - b.sort);
    const i = sorted.findIndex((r) => r.slug === row.slug);
    const j = i + dir;
    if (j < 0 || j >= sorted.length) return;
    setBusy(true);
    await supabase!.from('categories').upsert([
      { ...sorted[i], sort: sorted[j].sort, dirty: undefined },
      { ...sorted[j], sort: sorted[i].sort, dirty: undefined },
    ]);
    setBusy(false);
    await reload();
    flash('Порядок изменён');
  }

  async function add() {
    const name = prompt('Название новой группы:')?.trim();
    if (!name) return;
    const slug = 'cat' + Date.now().toString(36);
    setBusy(true);
    const { error } = await supabase!.from('categories').insert({
      slug,
      name,
      descr: '',
      photo: STOCK_PHOTOS[0].src,
      sort: Math.max(0, ...rows.map((r) => r.sort)) + 1,
    });
    setBusy(false);
    if (error) return flash('Ошибка: ' + error.message);
    await reload();
    setRows((rs) => [
      ...rs,
      { slug, name, descr: '', photo: STOCK_PHOTOS[0].src, sort: rs.length },
    ]);
    flash('Группа создана — выберите фон и добавьте описание');
  }

  /** Первичное наполнение: переносим четыре группы из кода в базу. */
  async function seed() {
    setBusy(true);
    // upsert, а не insert: группы могли уже появиться при импорте прайса
    // на соседней вкладке, и повторное нажатие не должно падать с ошибкой
    const { error } = await supabase!.from('categories').upsert(
      CATEGORIES.map((c, i) => ({
        slug: c.slug,
        name: c.name,
        descr: c.desc,
        photo: c.photo,
        sort: i,
      })),
      { onConflict: 'slug' }
    );
    setBusy(false);
    if (error) return flash('Ошибка: ' + error.message);
    await reload();
    setRows(
      CATEGORIES.map((c, i) => ({
        slug: c.slug,
        name: c.name,
        descr: c.desc,
        photo: c.photo,
        sort: i,
      }))
    );
    flash('Группы перенесены в базу');
  }

  const dbEmpty = cats.length > 0 && cats.every((c) => c.sort === -1);

  return (
    <>
      {dbEmpty && (
        <div className="rounded-3xl border border-[#e7e5e0] bg-white p-6 mb-8">
          <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
            Группы сейчас берутся из кода сайта и не редактируются. Перенесите их в базу —
            после этого название, описание и фон можно будет менять.
          </p>
          <button onClick={seed} disabled={busy} className={btnDark}>
            Перенести группы в базу
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {[...rows]
          .sort((a, b) => a.sort - b.sort)
          .map((row) => (
            <div key={row.slug} className="rounded-3xl border border-[#e7e5e0] bg-white p-5 sm:p-6">
              <div className="grid md:grid-cols-[200px_1fr] gap-6">
                <div>
                  <div
                    className="aspect-[4/3] rounded-2xl bg-cover bg-center border border-[#e7e5e0] mb-3"
                    style={{ backgroundImage: `url(${row.photo})` }}
                  />
                  <Label>Фон группы</Label>
                  <select
                    value={STOCK_PHOTOS.some((p) => p.src === row.photo) ? row.photo : 'custom'}
                    onChange={(e) =>
                      e.target.value !== 'custom' && edit(row.slug, { photo: e.target.value })
                    }
                    disabled={dbEmpty}
                    className={`${input} mb-2`}
                  >
                    {STOCK_PHOTOS.map((p) => (
                      <option key={p.src} value={p.src}>
                        {p.name}
                      </option>
                    ))}
                    <option value="custom">Своя ссылка</option>
                  </select>
                  <input
                    value={row.photo}
                    placeholder="https://…"
                    onChange={(e) => edit(row.slug, { photo: e.target.value })}
                    disabled={dbEmpty}
                    className={`${input} text-[12px] text-neutral-500`}
                  />
                </div>

                <div className="flex flex-col">
                  <Label>Название</Label>
                  <input
                    value={row.name}
                    onChange={(e) => edit(row.slug, { name: e.target.value })}
                    disabled={dbEmpty}
                    className={`${input} text-base mb-4`}
                  />
                  <Label>Описание на сайте</Label>
                  <textarea
                    value={row.descr}
                    rows={3}
                    onChange={(e) => edit(row.slug, { descr: e.target.value })}
                    disabled={dbEmpty}
                    className={`${input} resize-none flex-1`}
                  />

                  <div className="flex items-center gap-2 mt-4">
                    {row.dirty && (
                      <button onClick={() => save(row)} disabled={busy} className={btnDark}>
                        <Check className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                        Сохранить
                      </button>
                    )}
                    <button
                      onClick={() => move(row, -1)}
                      disabled={busy || dbEmpty}
                      className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors"
                      aria-label="Выше"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => move(row, 1)}
                      disabled={busy || dbEmpty}
                      className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors"
                      aria-label="Ниже"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => remove(row)}
                      disabled={busy || dbEmpty}
                      className="p-2 text-neutral-300 hover:text-[#e8501f] transition-colors ml-auto"
                      aria-label="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      <button
        onClick={add}
        disabled={busy || dbEmpty}
        className={`${btnGhost} mt-6 inline-flex items-center gap-2`}
      >
        <Plus className="w-4 h-4" /> Добавить группу
      </button>

      <p className="mt-6 text-[13px] text-neutral-400 leading-relaxed max-w-xl">
        Каталог на главной странице рассчитан на крупные горизонтальные фотографии.
        Для новой группы лучше выбрать один из готовых фонов — со случайной картинкой из
        интернета первый экран будет выглядеть заметно хуже.
      </p>
    </>
  );
}
