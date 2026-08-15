import { motion } from "framer-motion";
import { CtaButton } from "./cta";
import { useOrder } from "./order-modal";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, delay, ease: "easeOut" as const },
});

const OFFERS = [
  {
    n: "01",
    title: "Отгрузка в течение 3 дней",
    text: "500+ позиций постоянно на складе в Екатеринбурге и в Москве. Резервируем материал в день обращения и отгружаем в течение 3 рабочих дней — без «ожидайте поставку с завода».",
  },
  {
    n: "02",
    title: "Цена зафиксирована на весь объём",
    text: "Заключаем договор на объект — стоимость не меняется до конца поставки, даже если заводы поднимут отпускные цены.",
  },
  {
    n: "03",
    title: "Подбор системы покрытия — бесплатно",
    text: "Инженер-технолог подберёт грунт и эмаль под вашу среду эксплуатации: от С2 до С5-M. Ответ — в течение одного рабочего дня.",
  },
  {
    n: "04",
    title: "Доставка до объекта по всей России",
    text: "Отправляем транспортными компаниями и собственным транспортом — прямо на стройплощадку, а не до терминала в соседнем городе.",
  },
];

export default function Offers() {
  const { openOrder } = useOrder();

  return (
    <section className="px-5 sm:px-8 py-20 sm:py-28 max-w-6xl mx-auto">
      <motion.div {...fadeUp(0)} className="mb-12 sm:mb-16">
        <div className="text-xs font-medium tracking-[0.2em] uppercase text-[#e8501f] mb-5">
          / 01 — Почему мы
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <h2 className="font-display font-semibold tracking-[-0.03em] leading-[1.08] text-3xl sm:text-5xl max-w-2xl">
            Материал — в наличии.
            <br />
            Цена — в договоре.
            <br />
            <span className="text-neutral-400">Объект — по графику.</span>
          </h2>
          <p className="text-neutral-500 text-sm sm:text-[15px] leading-relaxed max-w-sm lg:text-right">
            Четыре правила, по которым мы работаем с каждой поставкой —
            от одной бочки до объёма на целый мост.
          </p>
        </div>
      </motion.div>

      <div className="border-t border-[#e0ded8]">
        {OFFERS.map((o, i) => (
          <motion.div
            key={o.n}
            {...fadeUp(0.06 * i)}
            className="group grid sm:grid-cols-[80px_1fr] lg:grid-cols-[80px_1.1fr_1fr] gap-x-8 gap-y-2 items-baseline border-b border-[#e0ded8] py-7 sm:py-9 hover:bg-white/70 transition-colors sm:px-4 sm:-mx-4"
          >
            <span className="font-display text-sm font-semibold text-[#e8501f]">
              {o.n}
            </span>
            <h3 className="font-display font-semibold tracking-[-0.02em] text-2xl sm:text-[1.7rem] leading-tight">
              {o.title}
            </h3>
            <p className="text-neutral-500 text-sm sm:text-[15px] leading-relaxed sm:col-start-2 lg:col-start-3">
              {o.text}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div {...fadeUp(0.1)} className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <CtaButton variant="dark" onClick={() => openOrder("Заказ звонка")}>
          Проверить наличие под ваш объект
        </CtaButton>
        <span className="text-sm text-neutral-400">Ответим за 15 минут в рабочее время</span>
      </motion.div>
    </section>
  );
}
