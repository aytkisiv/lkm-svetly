import type { ReactNode } from 'react';

/**
 * Оформление админки повторяет светлый стиль сайта: белые карточки,
 * тонкий бордер, капсульные кнопки, оранжевый акцент.
 */
export const input =
  'rounded-2xl border border-[#e7e5e0] bg-[#f4f3ef] px-4 py-2.5 text-sm outline-none focus:border-neutral-400 transition-colors w-full';

export const btnDark =
  'rounded-full bg-neutral-900 text-white text-sm font-medium px-5 py-2.5 hover:bg-black transition-colors disabled:opacity-50';

export const btnAccent =
  'rounded-full bg-[#e8501f] text-white text-sm font-medium px-5 py-2.5 hover:bg-[#d4451a] transition-colors disabled:opacity-50';

export const btnGhost =
  'rounded-full border border-[#e7e5e0] bg-white text-sm font-medium px-5 py-2.5 text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 transition-colors disabled:opacity-50';

export function Label({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400 mb-2">
      {children}
    </div>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-3xl border border-[#e7e5e0] bg-white p-5 sm:p-6">{children}</div>;
}
