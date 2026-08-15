import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useCatalog } from "../hooks/useCatalog";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, delay, ease: "easeOut" as const },
});

export default function Catalog() {
  const CATEGORIES = useCatalog();

  return (
    <section id="catalog" className="px-5 sm:px-8 py-16 sm:py-24 max-w-6xl mx-auto">
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14">
        <div>
        <div className="text-xs font-medium tracking-[0.2em] uppercase text-[#e8501f] mb-5">
          / 02 — Каталог
        </div>
        <h2 className="font-display font-semibold tracking-[-0.03em] leading-[1.05] text-3xl sm:text-5xl">
          Каталог
          <span className="text-neutral-400"> материалов</span>
        </h2>
        </div>
        <p className="text-neutral-500 text-sm sm:text-[15px] leading-relaxed max-w-sm">
          Четыре направления защитных покрытий для промышленных и строительных объектов.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
        {CATEGORIES.map((c, i) => (
          <motion.a
            key={c.name}
            {...fadeUp(0.08 * i)}
            href="#price"
            className="group relative rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[16/11] block"
          >
            <img
              src={c.photo}
              alt={c.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

            <div className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center transition-colors group-hover:bg-white group-hover:text-neutral-900 text-white">
              <ArrowUpRight className="w-4.5 h-4.5" />
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <h3 className="font-display font-semibold text-2xl sm:text-3xl text-white tracking-tight">
                  {c.name}
                </h3>
                <span className="rounded-full bg-white/15 backdrop-blur-md px-3 py-1 text-[11px] text-white/90">
                  {c.products.length} позиций
                </span>
              </div>
              <p className="mt-2 text-white/70 text-[13px] sm:text-sm leading-relaxed max-w-md">
                {c.desc}
              </p>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
