import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useCatalog } from "../hooks/useCatalog";
import { useOrder } from "./order-modal";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, delay, ease: "easeOut" as const },
});

export default function PriceList() {
  const CATEGORIES = useCatalog();
  const [active, setActive] = useState(0);
  const { openOrder } = useOrder();
  // список групп приходит из базы и может оказаться короче, чем был при клике
  const cat = CATEGORIES[active] ?? CATEGORIES[0];

  return (
    <section id="price" className="px-5 sm:px-8 py-16 sm:py-24 max-w-6xl mx-auto">
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
        <div>
          <div className="text-xs font-medium tracking-[0.2em] uppercase text-[#e8501f] mb-5">
            / 03 — Прайс
          </div>
          <h2 className="font-display font-semibold tracking-[-0.03em] leading-[1.05] text-3xl sm:text-5xl">
            Прайс <span className="text-neutral-400">на материалы</span>
          </h2>
        </div>
        <p className="text-neutral-500 text-sm leading-relaxed max-w-sm">
          Цены за 1 кг при оптовом заказе. Под объём объекта дадим
          персональную цену — и зафиксируем её договором.
          <span className="block mt-1.5 text-neutral-400">
            Минимальный заказ — 100 кг, без скидок.
          </span>
        </p>
      </motion.div>

      <motion.div {...fadeUp(0.05)} className="flex flex-wrap gap-2 mb-6 sm:mb-8">
        {CATEGORIES.map((c, i) => (
          <button
            key={c.name}
            onClick={() => setActive(i)}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
              i === active
                ? "bg-neutral-900 text-white"
                : "bg-white border border-[#e7e5e0] text-neutral-500 hover:text-neutral-900 hover:border-neutral-300"
            }`}
          >
            {c.name}
            <span className="ml-2 opacity-50">{c.products.length}</span>
          </button>
        ))}
      </motion.div>

      <motion.div {...fadeUp(0.1)} className="rounded-3xl border border-[#e7e5e0] bg-white overflow-hidden">
        {cat.products.map((p, i) => (
          <div
            key={p.name}
            className={`group flex items-center gap-4 sm:gap-8 px-5 sm:px-8 py-4 sm:py-5 hover:bg-[#f4f3ef] transition-colors cursor-pointer ${
              i !== 0 ? "border-t border-[#f0eeea]" : ""
            }`}
            onClick={() => openOrder(p.name)}
          >
            <span className="hidden sm:block text-xs text-neutral-300 font-medium w-6">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] sm:text-base font-medium">{p.name}</div>
              {p.note && (
                <div className="mt-0.5 text-xs sm:text-[13px] text-neutral-400 truncate">
                  {p.note}
                </div>
              )}
            </div>
            <span className="text-sm sm:text-[15px] text-neutral-500 whitespace-nowrap">
              {p.price} ₽/кг
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openOrder(p.name);
              }}
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#e7e5e0] group-hover:border-neutral-900 group-hover:bg-neutral-900 group-hover:text-white px-5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap"
            >
              Заказать
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </motion.div>

      <motion.p {...fadeUp(0.1)} className="mt-5 text-sm text-neutral-400 text-center">
        Нет нужной позиции? Привезём под заказ —{" "}
        <button
          onClick={() => openOrder()}
          className="text-[#e8501f] hover:text-neutral-900 transition-colors underline underline-offset-4"
        >
          оставьте заявку
        </button>
      </motion.p>
    </section>
  );
}
