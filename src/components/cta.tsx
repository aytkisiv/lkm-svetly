import { ArrowUpRight } from "lucide-react";
import type { ReactNode, ComponentProps } from "react";

/**
 * Фирменная кнопка: капсула + круглая "таблетка" со стрелкой.
 * Варианты:
 *  accent — оранжевая, белый круг (главный CTA)
 *  dark   — чёрная, оранжевый круг
 *  light  — белая, оранжевый круг (на тёмном/фото)
 *  glass  — стеклянная на фото
 */
const VARIANTS = {
  accent: {
    pill: "bg-[#e8501f] text-white hover:bg-[#d4451a]",
    circle: "bg-white text-[#e8501f]",
  },
  dark: {
    pill: "bg-neutral-900 text-white hover:bg-black",
    circle: "bg-[#e8501f] text-white",
  },
  light: {
    pill: "bg-white text-neutral-900 hover:bg-neutral-100",
    circle: "bg-[#e8501f] text-white",
  },
  glass: {
    pill: "border border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20",
    circle: "bg-white/15 border border-white/25 text-white",
  },
} as const;

type Variant = keyof typeof VARIANTS;

function Inner({ children, variant, size }: { children: ReactNode; variant: Variant; size: "md" | "lg" }) {
  const v = VARIANTS[variant];
  return (
    <>
      <span className={size === "lg" ? "pl-2" : "pl-1"}>{children}</span>
      <span
        className={`${v.circle} ${size === "lg" ? "w-10 h-10" : "w-8 h-8"} rounded-full flex items-center justify-center shrink-0 overflow-hidden relative`}
      >
        {/* стрелка "вылетает" по диагонали, вторая приходит на её место */}
        <ArrowUpRight
          className={`${size === "lg" ? "w-4.5 h-4.5" : "w-4 h-4"} absolute transition-transform duration-300 ease-out group-hover/cta:translate-x-[150%] group-hover/cta:-translate-y-[150%]`}
        />
        <ArrowUpRight
          className={`${size === "lg" ? "w-4.5 h-4.5" : "w-4 h-4"} absolute -translate-x-[150%] translate-y-[150%] transition-transform duration-300 ease-out group-hover/cta:translate-x-0 group-hover/cta:translate-y-0`}
        />
      </span>
    </>
  );
}

const base =
  "group/cta rounded-full font-medium inline-flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.97]";
const sizes = {
  md: "text-sm pl-5 pr-1.5 py-1.5",
  lg: "text-[15px] pl-7 pr-2 py-2",
};

export function CtaButton({
  variant = "accent",
  size = "lg",
  className = "",
  children,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: "md" | "lg" }) {
  return (
    <button className={`${base} ${sizes[size]} ${VARIANTS[variant].pill} ${className}`} {...props}>
      <Inner variant={variant} size={size}>{children}</Inner>
    </button>
  );
}

export function CtaLink({
  variant = "accent",
  size = "lg",
  className = "",
  children,
  ...props
}: ComponentProps<"a"> & { variant?: Variant; size?: "md" | "lg" }) {
  return (
    <a className={`${base} ${sizes[size]} ${VARIANTS[variant].pill} ${className}`} {...props}>
      <Inner variant={variant} size={size}>{children}</Inner>
    </a>
  );
}
