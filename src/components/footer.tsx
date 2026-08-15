import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { CtaButton } from "./cta";
import LazyVideo from "./lazy-video";
import { useOrder } from "./order-modal";

// Расплавленный металл в цехе (Pexels, свободная лицензия)
const METAL_VIDEO =
  "https://videos.pexels.com/video-files/5121701/5121701-hd_1920_1080_25fps.mp4";

export default function Footer() {
  const { openOrder } = useOrder();

  return (
    <footer id="contacts" className="px-4 sm:px-6 pb-6 pt-8">
      <div className="max-w-6xl mx-auto rounded-[2rem] overflow-hidden relative bg-[#141414]">
        {/* видео-фон CTA */}
        <div className="relative min-h-[420px] flex flex-col items-center justify-center text-center px-6 py-20">
          <LazyVideo
            src={METAL_VIDEO}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-[#141414]/60" />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10"
          >
            <span className="inline-block rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs text-white/80 mb-6">
              Ответим за 15 минут в рабочее время
            </span>
            <h2 className="font-display font-semibold tracking-[-0.03em] leading-[1.05] text-4xl sm:text-6xl text-white max-w-3xl">
              Обсудим <span className="text-white/50">ваш объект?</span>
            </h2>
            <p className="mt-5 text-white/60 text-sm sm:text-base max-w-xl mx-auto">
              Пришлите список позиций или просто опишите объект — подберём
              систему покрытия, посчитаем объём и зафиксируем цену.
            </p>
            <CtaButton variant="light" className="mt-8" onClick={() => openOrder()}>
              Оставить заявку
            </CtaButton>
          </motion.div>
        </div>

        {/* контакты */}
        <div className="relative border-t border-white/10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 px-7 sm:px-12 py-10">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-white/35 mb-3">Телефоны</div>
            <a href="tel:+73432903323" className="block text-sm text-white/80 hover:text-white transition-colors mb-1.5">
              8 (343) 290-33-23
            </a>
            <a href="tel:+79920033013" className="block text-sm text-white/80 hover:text-white transition-colors">
              +7 (992) 003-30-13
            </a>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-white/35 mb-3">Почта</div>
            <a href="mailto:lkm-opt2024@mail.ru" className="block text-sm text-white/80 hover:text-white transition-colors">
              lkm-opt2024@mail.ru
            </a>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-white/35 mb-3">Офис и склад</div>
            <p className="text-sm text-white/80 leading-relaxed">
              Екатеринбург
              <br />
              Пн–Пт, 9:00–18:00 без перерыва
            </p>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-white/35 mb-3">Разделы</div>
            {[
              { href: "#catalog", label: "Каталог" },
              { href: "#price", label: "Прайс" },
              { href: "#about", label: "О компании" },
              { href: "#partners", label: "Партнёры" },
            ].map((l) => (
              <a key={l.href} href={l.href} className="block text-sm text-white/80 hover:text-white transition-colors mb-1.5">
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <div className="relative border-t border-white/10 px-7 sm:px-12 py-5 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-white/35">
            © ЛКМ ОПТ, 2015–{new Date().getFullYear()}
          </span>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-xs text-white/35 hover:text-white/70 transition-colors"
          >
            Политика конфиденциальности
          </a>
          <a
            href="#top"
            className="group flex items-center gap-1.5 text-xs text-white/35 hover:text-white transition-colors"
          >
            Наверх
            <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
