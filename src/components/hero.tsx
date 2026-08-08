import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Package } from "lucide-react";
import { useOrder } from "./order-modal";
import { CtaButton, CtaLink } from "./cta";
import { PARTNERS } from "../data/products";

const appear = (delay: number) => ({
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
});

/** Заголовок с пословным появлением */
function StaggerLine({
  text,
  className,
  baseDelay,
}: {
  text: string;
  className?: string;
  baseDelay: number;
}) {
  return (
    <span className={className}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{
              duration: 0.85,
              delay: baseDelay + i * 0.09,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {w}
            {"\u00A0"}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export default function Hero() {
  const { openOrder } = useOrder();
  const sectionRef = useRef<HTMLElement>(null);

  // лёгкий параллакс фото при скролле
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.07]);

  return (
    <section ref={sectionRef} id="top" className="px-4 sm:px-6 pt-24 sm:pt-28 pb-2">
      {/* одна большая фото-карта на весь экран */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-[1400px] mx-auto rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden min-h-[78svh] sm:min-h-[82svh] flex flex-col justify-end"
      >
        <motion.div
          style={{ y: imgY, scale: imgScale }}
          className="absolute inset-0 will-change-transform"
        >
          <video
            src="/hero-loop.mp4"
            poster="/hero-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label="Мост со свежим защитным покрытием — идёт покраска"
            className="w-full h-full object-cover object-[center_60%]"
          />
        </motion.div>
        {/* затемнения для читаемости */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" />

        {/* бейдж сверху слева */}
        <motion.div {...appear(0.5)} className="absolute top-5 sm:top-7 left-5 sm:left-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/12 backdrop-blur-xl border border-white/20 px-4 py-2 text-xs sm:text-[13px] text-white/90">
            <Package className="w-3.5 h-3.5 text-[#ff6a35]" />
            500+ позиций ЛКМ на складе в Екатеринбурге
          </span>
        </motion.div>


        {/* текст внизу слева */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-3xl">
          <h1 className="font-display font-semibold tracking-[-0.03em] leading-[1.06] text-[2.4rem] sm:text-6xl lg:text-[4.4rem] text-white">
            <StaggerLine text="Краска для объекта" baseDelay={0.35} className="block" />
            <span className="block overflow-visible whitespace-nowrap">
              <motion.span
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block align-baseline"
              >
                уже{"\u00A0"}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.74, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block align-baseline font-accent font-normal tracking-[-0.01em] text-white/85"
              >
                на складе.
              </motion.span>
            </span>
          </h1>

          <motion.p
            {...appear(0.95)}
            className="mt-6 text-white/60 text-[15px] sm:text-lg leading-relaxed max-w-xl"
          >
            Отгрузим <em className="font-accent text-white">завтра</em> — по
            цене, зафиксированной <em className="font-accent text-white">сегодня</em>.
            <span className="block mt-1 text-white/45 text-sm sm:text-base">
              Грунт-эмали, грунты, эмали и мастики — напрямую от 7 российских заводов.
            </span>
          </motion.p>

          <motion.div
            {...appear(1.1)}
            className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <CtaButton variant="light" onClick={() => openOrder("Заказ звонка")}>
              Заказать звонок
            </CtaButton>
            <CtaLink variant="glass" href="#catalog">
              Смотреть каталог
            </CtaLink>
          </motion.div>
        </div>

        {/* партнёры внизу карты */}
        <motion.div {...appear(1.25)} className="relative z-10 border-t border-white/15 py-5 overflow-hidden">
          <div className="marquee-track flex w-max items-center gap-16 sm:gap-20 px-8">
            {[...PARTNERS, ...PARTNERS].map((p, i) => (
              <img
                key={i}
                src={p.logo}
                alt={p.name}
                title={p.name}
                className="h-8 sm:h-10 w-auto object-contain brightness-0 invert opacity-80"
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
