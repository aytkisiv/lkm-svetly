import { motion } from "framer-motion";
import { PARTNERS } from "../data/products";

export default function Statement() {
  return (
    <section id="partners" className="px-5 sm:px-8 py-20 sm:py-28 max-w-5xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-xs font-medium tracking-[0.2em] uppercase text-[#e8501f] mb-8"
      >
        / 05 — Партнёры
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="font-display font-medium tracking-[-0.02em] leading-[1.25] text-2xl sm:text-4xl"
      >
        Мы поставляем покрытия, которыми защищают мосты, трубопроводы
        и цеха <span className="text-neutral-400">Газпрома, РЖД, Норникеля и Лукойла</span> —
        и отгружаем их вам со склада, а не «под заказ через месяц».
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-5 gap-3"
      >
        {PARTNERS.map((p) => (
          <div
            key={p.name}
            className="rounded-2xl border border-[#e7e5e0] bg-white h-20 flex items-center justify-center px-6"
          >
            <img
              src={p.logo}
              alt={p.name}
              title={p.name}
              className="max-h-9 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all"
            />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
