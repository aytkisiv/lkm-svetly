import { createContext, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Check, Loader2, ArrowUpRight } from "lucide-react";

type OrderCtx = { openOrder: (product?: string) => void };
const Ctx = createContext<OrderCtx>({ openOrder: () => {} });
export const useOrder = () => useContext(Ctx);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  // Ловушка для ботов. Имя намеренно нейтральное: поле с именем вроде website
  // заполняют менеджеры паролей на телефонах, и живые заявки пропадают.
  const [hp, setHp] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, product, comment, hp }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "");
      setSent(true);
    } catch (e) {
      setError(
        (e instanceof Error && e.message) ||
          "Не удалось отправить. Попробуйте ещё раз или позвоните нам."
      );
    } finally {
      setPending(false);
    }
  };

  const openOrder = (p?: string) => {
    setProduct(p);
    setSent(false);
    setError("");
    setOpen(true);
  };

  return (
    <Ctx.Provider value={{ openOrder }}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-7 sm:p-9"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-display font-semibold text-2xl tracking-tight">
                    {sent ? "Заявка отправлена" : "Оставить заявку"}
                  </h3>
                  {!sent && (
                    <p className="mt-1.5 text-sm text-neutral-500">
                      {product ? (
                        <>Позиция: <span className="text-neutral-900 font-medium">{product}</span></>
                      ) : (
                        "Перезвоним в течение 15 минут в рабочее время"
                      )}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 -m-2 text-neutral-400 hover:text-neutral-900 transition-colors"
                  aria-label="Закрыть"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {sent ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#e8501f]/10 flex items-center justify-center mb-4">
                    <Check className="w-6 h-6 text-[#e8501f]" />
                  </div>
                  <p className="text-neutral-600 text-sm max-w-xs">
                    Спасибо! Менеджер свяжется с вами и вышлет прайс с расчётом под ваш объект.
                  </p>
                  <button
                    onClick={() => setOpen(false)}
                    className="mt-6 rounded-full bg-neutral-900 text-white text-sm font-medium px-8 py-3.5 hover:bg-black transition-colors"
                  >
                    Готово
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!pending) void submit();
                  }}
                  className="space-y-3"
                >
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={hp}
                    onChange={(e) => setHp(e.target.value)}
                    className="absolute w-px h-px opacity-0 -z-10 pointer-events-none"
                  />
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ваше имя"
                    className="w-full rounded-2xl border border-[#e7e5e0] bg-[#f4f3ef] px-5 py-3.5 text-sm outline-none focus:border-neutral-400 transition-colors"
                  />
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Телефон"
                    className="w-full rounded-2xl border border-[#e7e5e0] bg-[#f4f3ef] px-5 py-3.5 text-sm outline-none focus:border-neutral-400 transition-colors"
                  />
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Объект, объём, сроки — по желанию"
                    rows={2}
                    className="w-full rounded-2xl border border-[#e7e5e0] bg-[#f4f3ef] px-5 py-3.5 text-sm outline-none focus:border-neutral-400 transition-colors resize-none"
                  />
                  {error && <p className="text-xs text-red-600">{error}</p>}
                  <button
                    type="submit"
                    disabled={pending}
                    className="group/cta w-full rounded-full bg-[#e8501f] text-white text-sm font-medium pl-6 pr-2 py-2 hover:bg-[#d4451a] transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-between gap-3"
                  >
                    <span className="flex-1 text-center flex items-center justify-center gap-2">
                      {pending && <Loader2 className="w-4 h-4 animate-spin" />}
                      Отправить заявку
                    </span>
                    <span className="w-9 h-9 rounded-full bg-white text-[#e8501f] flex items-center justify-center shrink-0 overflow-hidden relative">
                      <ArrowUpRight className="w-4 h-4 absolute transition-transform duration-300 ease-out group-hover/cta:translate-x-[150%] group-hover/cta:-translate-y-[150%]" />
                      <ArrowUpRight className="w-4 h-4 absolute -translate-x-[150%] translate-y-[150%] transition-transform duration-300 ease-out group-hover/cta:translate-x-0 group-hover/cta:translate-y-0" />
                    </span>
                  </button>
                  <p className="text-[11px] text-neutral-400 text-center">
                    Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
                  </p>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}
