import { useEffect, useState } from 'react';
import { Phone, Copy, Check, Clock } from 'lucide-react';
import { supabase, type DbOrder } from '../../lib/supabase';
import { btnDark, btnGhost } from './ui';

const FILTERS: { id: DbOrder['status'] | 'all'; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'new', label: 'Новые' },
  { id: 'in_work', label: 'В работе' },
  { id: 'done', label: 'Завершённые' },
];

const STATUS_LABEL: Record<DbOrder['status'], string> = {
  new: 'Новая',
  in_work: 'В работе',
  done: 'Завершена',
};

const STATUS_CLASS: Record<DbOrder['status'], string> = {
  new: 'bg-[#e8501f]/10 text-[#e8501f]',
  in_work: 'bg-amber-100 text-amber-700',
  done: 'bg-neutral-100 text-neutral-500',
};

export default function OrdersTab({ flash }: { flash: (t: string) => void }) {
  const [orders, setOrders] = useState<DbOrder[] | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [who, setWho] = useState('менеджер');

  useEffect(() => {
    load();
    supabase!.auth.getUser().then(({ data }) => {
      if (data.user?.email) setWho(data.user.email);
    });
  }, []);

  async function load() {
    const { data, error } = await supabase!
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return flash('Не удалось загрузить заявки: ' + error.message);
    setOrders((data as DbOrder[]) || []);
  }

  async function setStatus(order: DbOrder, status: DbOrder['status']) {
    setBusyId(order.id);
    const { error } = await supabase!
      .from('orders')
      .update({ status, taken_by: status === 'new' ? null : who })
      .eq('id', order.id);
    setBusyId(null);
    if (error) return flash('Не удалось обновить: ' + error.message);
    setOrders((os) =>
      (os || []).map((o) => (o.id === order.id ? { ...o, status, taken_by: who } : o))
    );
  }

  async function copyPhone(phone: string) {
    await navigator.clipboard.writeText(phone);
    flash('Телефон скопирован');
  }

  if (orders === null) return <p className="text-sm text-neutral-400">Загружаем…</p>;

  const visible = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              f.id === filter
                ? 'bg-neutral-900 text-white'
                : 'bg-white border border-[#e7e5e0] text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
            }`}
          >
            {f.label}
            <span className="ml-2 opacity-60">
              {f.id === 'all' ? orders.length : orders.filter((o) => o.status === f.id).length}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="rounded-3xl border border-[#e7e5e0] bg-white p-6">
          <p className="text-sm text-neutral-500">В этом фильтре заявок нет.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {visible.map((o) => {
          const digits = o.phone.replace(/\D/g, '').replace(/^8/, '7');
          return (
            <div key={o.id} className="rounded-3xl border border-[#e7e5e0] bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{o.name}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_CLASS[o.status]}`}
                    >
                      {STATUS_LABEL[o.status]}
                    </span>
                  </div>
                  {o.product && (
                    <div className="mt-1 text-sm text-neutral-500">Интересует: {o.product}</div>
                  )}
                  {o.comment && (
                    <div className="mt-1 text-sm text-neutral-500 italic">«{o.comment}»</div>
                  )}
                  {o.taken_by && o.status !== 'new' && (
                    <div className="mt-1 text-xs text-neutral-400">Взял: {o.taken_by}</div>
                  )}
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-400">
                    <Clock className="w-3.5 h-3.5" />
                    {new Intl.DateTimeFormat('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(o.created_at))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${digits}`}
                      className="flex items-center gap-1.5 text-sm text-neutral-700 hover:text-neutral-900"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {o.phone}
                    </a>
                    <button
                      onClick={() => copyPhone(o.phone)}
                      aria-label="Скопировать телефон"
                      className="p-1.5 text-neutral-300 hover:text-neutral-900 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {o.status === 'new' && (
                      <button
                        onClick={() => setStatus(o, 'in_work')}
                        disabled={busyId === o.id}
                        className={btnDark}
                      >
                        Взять в работу
                      </button>
                    )}
                    {o.status === 'in_work' && (
                      <button
                        onClick={() => setStatus(o, 'done')}
                        disabled={busyId === o.id}
                        className={btnDark}
                      >
                        <Check className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                        Завершить
                      </button>
                    )}
                    {o.status === 'done' && (
                      <button
                        onClick={() => setStatus(o, 'new')}
                        disabled={busyId === o.id}
                        className={btnGhost}
                      >
                        Вернуть в новые
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
