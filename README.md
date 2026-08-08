# ЛКМ ОПТ — сайт (светлый редизайн)

Одностраничный сайт оптовых поставок промышленных ЛКМ + админка прайса на `/admin`.

**Стек:** React 19 · Vite 7 · Tailwind v4 · framer-motion · wouter.
**Хостинг:** Vercel (статика + serverless-функции в `/api`, runtime edge).
**База:** Supabase (`products`, `categories`, `orders`).

## Запуск

```
npm install
npm run dev      # http://localhost:5180
npm run build    # прод-сборка в dist/
```

## Что где лежит

- `src/components/` — секции страницы: navbar, hero, offers, catalog, price-list, about, statement, footer, order-modal, cta (фирменная кнопка)
- `src/data/products.ts` — каталог и прайс, зашитый в код. Используется как запасной, если база недоступна: пустой прайс посетитель не увидит никогда
- `src/styles.css` — стили и токены Tailwind v4
- `public/` — фото категорий, hero-фото и видео, логотипы партнёров
- `api/` — serverless-функции Vercel (заявки, телеграм-бот)
- `design.md` — описание дизайна и секций

## Переменные окружения (Vercel)

| Переменная | Назначение |
| --- | --- |
| `VITE_SUPABASE_URL` | адрес проекта Supabase |
| `VITE_SUPABASE_ANON_KEY` | публичный ключ: чтение прайса, вход в админку |
| `SUPABASE_SERVICE_ROLE_KEY` | служебный ключ, **только сервер**. Без приставки `VITE_` — иначе значение попадёт в код сайта |
| `TELEGRAM_BOT_TOKEN` | токен бота |
| `TELEGRAM_CHAT_ID` | chat id менеджеров через запятую |

Переменные подхватываются только после **Redeploy** — сохранить в настройках недостаточно.
