import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Info, X } from "lucide-react";
import { useCatalog } from "../hooks/useCatalog";
import { useOrder } from "./order-modal";
import type { Product } from "../data/products";

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

  // всплывающее фото банки при наведении — следует за курсором
  const [preview, setPreview] = useState<{ src: string; x: number; y: number } | null>(null);
  // карточка с описанием и нюансами применения — открывается по кнопке "i"
  const [details, setDetails] = useState<Product | null>(null);

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
            onClick={() => {
              setActive(i);
              setPreview(null);
            }}
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
            onMouseMove={(e) =>
              p.photo && setPreview({ src: p.photo, x: e.clientX, y: e.clientY })
            }
            onMouseLeave={() => setPreview(null)}
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
                setDetails(p);
              }}
              aria-label="О товаре: описание и свойства"
              className="p-2 -m-2 text-neutral-300 hover:text-neutral-900 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
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

      {/* фото банки под курсором — только на устройствах с наведением */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.15 }}
            className="hidden sm:block fixed z-50 pointer-events-none w-40 h-40 rounded-2xl overflow-hidden border border-[#e7e5e0] bg-white shadow-xl"
            style={{ left: preview.x + 24, top: preview.y - 90 }}
          >
            <img src={preview.src} alt="" className="w-full h-full object-cover" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* карточка товара: описание, свойства и нюансы применения */}
      <AnimatePresence>
        {details && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
            onClick={() => setDetails(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden"
            >
              {details.photo && (
                <img src={details.photo} alt="" className="w-full h-48 object-cover" />
              )}
              <div className="p-7 sm:p-9">
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div>
                    <h3 className="font-display font-semibold text-xl sm:text-2xl tracking-tight">
                      {details.name}
                    </h3>
                    {details.note && (
                      <p className="mt-1 text-sm text-neutral-400">{details.note}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setDetails(null)}
                    className="p-2 -m-2 text-neutral-400 hover:text-neutral-900 transition-colors shrink-0"
                    aria-label="Закрыть"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                  {details.description ||
                    "Подробное описание уточняйте у менеджера — расскажем про свойства и нюансы применения под ваш объект."}
                </p>

                <div className="mt-7 flex items-center justify-between gap-4 pt-6 border-t border-[#f0eeea]">
                  <span className="text-lg font-medium">{details.price} ₽/кг</span>
                  <button
                    onClick={() => {
                      const name = details.name;
                      setDetails(null);
                      openOrder(name);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 text-white px-6 py-3 text-sm font-medium hover:bg-black transition-colors whitespace-nowrap"
                  >
                    Заказать
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
