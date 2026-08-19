import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useOrder } from "./order-modal";
import { CtaButton } from "./cta";

const LINKS = [
  { href: "#catalog", label: "Каталог" },
  { href: "#price", label: "Прайс" },
  { href: "#about", label: "О компании" },
  { href: "#contacts", label: "Контакты" },
];

export default function Navbar() {
  const { openOrder } = useOrder();
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 pt-4"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 rounded-full border border-[#e7e5e0] bg-white/80 backdrop-blur-xl pl-6 pr-2 py-2">
        <a href="#top" className="font-display font-bold tracking-tight text-lg">
          ЛКМ&nbsp;СНАБ<span className="text-[#e8501f]">.</span>
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-4 py-2 rounded-full text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="tel:+79966003293"
            className="hidden lg:block text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
          >
            +7 (996) 600-32-93
          </a>
          <CtaButton variant="dark" size="md" className="hidden sm:inline-flex" onClick={() => openOrder()}>
            Оставить заявку
          </CtaButton>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-3 text-neutral-700"
            aria-label="Меню"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden max-w-6xl mx-auto mt-2 rounded-3xl border border-[#e7e5e0] bg-white/95 backdrop-blur-xl p-4">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 rounded-2xl text-[15px] text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              openOrder();
            }}
            className="w-full mt-2 rounded-full bg-neutral-900 text-white text-sm font-medium py-3.5"
          >
            Получить прайс
          </button>
        </div>
      )}
    </motion.header>
  );
}
