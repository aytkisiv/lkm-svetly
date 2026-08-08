import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { LogOut, Loader2, AlertTriangle } from 'lucide-react';
import { supabase, type DbCategory } from '../../lib/supabase';
import { CATEGORIES } from '../../data/products';
import ProductsTab from './ProductsTab';
import CategoriesTab from './CategoriesTab';
import StatsTab from './StatsTab';
import { input, btnDark } from './ui';

type Tab = 'products' | 'categories' | 'stats';

const TABS: { id: Tab; label: string }[] = [
  { id: 'products', label: 'Товары' },
  { id: 'categories', label: 'Группы' },
  { id: 'stats', label: 'Сводка' },
];

export default function Admin() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>('products');
  const [cats, setCats] = useState<DbCategory[]>([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const flash = useCallback((t: string) => {
    setMsg(t);
    setTimeout(() => setMsg((m) => (m === t ? '' : m)), 3500);
  }, []);

  /** Группы из базы; пока их там нет — показываем встроенные с пометкой sort: -1. */
  const loadCats = useCallback(async () => {
    const { data } = await supabase!.from('categories').select('*').order('sort');
    setCats(
      data?.length
        ? (data as DbCategory[])
        : CATEGORIES.map((c) => ({
            slug: c.slug,
            name: c.name,
            descr: c.desc,
            photo: c.photo,
            sort: -1,
          }))
    );
  }, []);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authed) loadCats();
  }, [authed, loadCats]);

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setMsg('');
    const { error } = await supabase!.auth.signInWithPassword({
      email: String(f.get('email')),
      password: String(f.get('password')),
    });
    setBusy(false);
    if (error) setMsg('Не удалось войти. Проверьте почту и пароль.');
  }

  if (!ready)
    return (
      <Screen>
        <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
      </Screen>
    );

  if (!supabase)
    return (
      <Screen>
        <div className="max-w-md text-center">
          <AlertTriangle className="w-6 h-6 text-[#e8501f] mx-auto mb-4" />
          <h1 className="font-display font-semibold tracking-tight text-2xl mb-3">
            База не подключена
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Не заданы переменные <code className="text-neutral-900">VITE_SUPABASE_URL</code> и{' '}
            <code className="text-neutral-900">VITE_SUPABASE_ANON_KEY</code>. Сайт работает на
            встроенном прайсе.
          </p>
        </div>
      </Screen>
    );

  if (!authed)
    return (
      <Screen>
        <form onSubmit={login} className="w-full max-w-sm">
          <div className="text-xs font-medium tracking-[0.2em] uppercase text-[#e8501f] mb-4">
            ЛКМ ОПТ — панель управления
          </div>
          <h1 className="font-display font-semibold tracking-[-0.03em] text-4xl mb-8">Вход</h1>
          <input
            name="email"
            type="email"
            required
            placeholder="Почта"
            className={`${input} mb-3`}
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Пароль"
            className={`${input} mb-6`}
          />
          <button disabled={busy} className={`${btnDark} w-full py-3.5`}>
            {busy ? 'Входим…' : 'Войти'}
          </button>
          {msg && <p className="mt-4 text-[13px] text-red-600">{msg}</p>}
        </form>
      </Screen>
    );

  return (
    <div className="min-h-screen bg-[#f4f3ef] text-[#141414]">
      <header className="border-b border-[#e7e5e0] bg-white/80 backdrop-blur px-5 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <div className="font-display font-semibold tracking-tight text-lg">
            ЛКМ ОПТ<span className="text-[#e8501f]">.</span>
          </div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-400 mt-0.5">
            Панель управления
          </div>
        </div>
        <div className="flex items-center gap-5">
          <a href="/" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            На сайт
          </a>
          <button
            onClick={() => supabase!.auth.signOut()}
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Выйти
          </button>
        </div>
      </header>

      <nav className="px-5 sm:px-8 py-5 flex flex-wrap gap-2 max-w-5xl mx-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-neutral-900 text-white'
                : 'bg-white border border-[#e7e5e0] text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="px-5 sm:px-8 pb-16 max-w-5xl mx-auto">
        {tab === 'products' && <ProductsTab cats={cats} flash={flash} />}
        {tab === 'categories' && <CategoriesTab cats={cats} reload={loadCats} flash={flash} />}
        {tab === 'stats' && <StatsTab flash={flash} />}
      </main>

      {msg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-neutral-900 text-white text-sm px-6 py-3 max-w-[90vw] text-center shadow-lg">
          {msg}
        </div>
      )}
    </div>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f3ef] text-[#141414] flex items-center justify-center px-5">
      {children}
    </div>
  );
}
