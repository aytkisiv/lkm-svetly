import { motion } from "framer-motion";
import LazyVideo from "./lazy-video";
import { useOrder } from "./order-modal";
import { CtaButton } from "./cta";

// Промышленная покраска металла распылителем (Pexels, свободная лицензия).
// Видео лежит у нас, а не на videos.pexels.com: внешний CDN у части
// провайдеров РФ не грузился вообще — карточка оставалась пустой.
const PAINT_VIDEO = "/about-loop.mp4";
const PAINT_POSTER = "/about-poster.jpg";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, delay, ease: "easeOut" as const },
});

const STATS = [
  { value: "10+", label: "лет в оптовых поставках ЛКМ" },
  { value: "500+", label: "позиций в каталоге и на складе" },
  { value: "7", label: "заводов-производителей напрямую" },
  { value: "100%", label: "поставок — точно в срок" },
];

export default function About() {
  const { openOrder } = useOrder();

  return (
    <section id="about" className="px-5 sm:px-8 py-16 sm:py-24 max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-5 items-stretch">
        {/* видео-карточка */}
        <motion.div
          {...fadeUp(0.1)}
          className="relative rounded-3xl overflow-hidden min-h-[320px] sm:min-h-[420px]"
        >
          <LazyVideo
            src={PAINT_VIDEO}
            poster={PAINT_POSTER}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
          <span className="absolute bottom-5 left-5 rounded-full bg-black/40 backdrop-blur-md px-4 py-1.5 text-[11px] tracking-wide text-white/90">
            Нанесение покрытия · контроль качества
          </span>
        </motion.div>

        {/* текст и цифры */}
        <motion.div
          {...fadeUp(0)}
          className="rounded-3xl border border-[#e7e5e0] bg-white p-7 sm:p-10 flex flex-col"
        >
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-[#e8501f] mb-6">
            / 04 — О компании
          </span>
          <h2 className="font-display font-semibold tracking-[-0.03em] leading-[1.08] text-3xl sm:text-4xl">
            Поставки, которые{" "}
            <span className="text-neutral-400">не останавливают стройку</span>
          </h2>
          <p className="mt-5 text-neutral-500 text-sm sm:text-[15px] leading-relaxed">
            Более десяти лет строительные компании и промышленные подрядчики
            закрывают через нас потребность в специализированных защитных
            покрытиях — от антикоррозионных грунтов до полисилоксановых эмалей
            для мостов.
          </p>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 mt-9">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="font-display font-semibold text-3xl sm:text-4xl tracking-tight">
                  {s.value}
                </div>
                <div className="mt-1.5 text-xs sm:text-[13px] text-neutral-400 leading-snug">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-9 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#f0eeea]">
            <p className="text-sm text-neutral-500">
              Сергей Маляров, отдел продаж
              <br />
              Пн–Пт, 9:00–18:00 без перерыва
            </p>
            <CtaButton variant="dark" className="shrink-0" onClick={() => openOrder("Заказ звонка")}>
              Заказать звонок
            </CtaButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
