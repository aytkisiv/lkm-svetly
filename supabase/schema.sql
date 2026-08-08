-- ЛКМ ОПТ — схема базы и правила доступа.
-- Выполняется один раз в Supabase → SQL Editor → New query → Run.

-- ─────────────────────────────────────────────────────────────
-- Таблицы
-- ─────────────────────────────────────────────────────────────

create table if not exists categories (
  slug  text primary key,
  name  text not null,
  descr text not null default '',
  photo text not null default '',
  sort  int  not null default 0
);

create table if not exists products (
  id       uuid primary key default gen_random_uuid(),
  category text not null references categories(slug) on update cascade,
  name     text not null,
  note     text,
  price    int  not null default 0,
  sort     int  not null default 0
);

create index if not exists products_category_sort_idx on products (category, sort);

-- Заявки с сайта. Здесь телефоны клиентов — доступ к таблице максимально узкий.
create table if not exists orders (
  id         uuid primary key default gen_random_uuid(),
  product    text,
  name       text not null,
  phone      text not null,
  email      text,
  comment    text,
  status     text not null default 'new' check (status in ('new', 'in_work', 'done')),
  taken_by   text,
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on orders (created_at desc);

-- ─────────────────────────────────────────────────────────────
-- RLS. Включена везде: без включённой RLS публичный ключ
-- читает и пишет таблицу целиком.
-- ─────────────────────────────────────────────────────────────

alter table categories enable row level security;
alter table products   enable row level security;
alter table orders     enable row level security;

-- Прайс: читают все посетители сайта, меняет только вошедший в админку.
drop policy if exists "categories: чтение всем"          on categories;
drop policy if exists "categories: изменение вошедшим"   on categories;
create policy "categories: чтение всем"
  on categories for select to anon, authenticated using (true);
create policy "categories: изменение вошедшим"
  on categories for all to authenticated using (true) with check (true);

drop policy if exists "products: чтение всем"        on products;
drop policy if exists "products: изменение вошедшим" on products;
create policy "products: чтение всем"
  on products for select to anon, authenticated using (true);
create policy "products: изменение вошедшим"
  on products for all to authenticated using (true) with check (true);

-- Заявки: для публичного ключа (anon) НЕ создаётся ни одного правила.
-- Значит, с сайта таблицу нельзя ни прочитать, ни записать, ни удалить.
--
-- Пишет в неё только сервер служебным ключом service_role — он RLS
-- не подчиняется. Читает вошедший в админку менеджер, для «Сводки».
drop policy if exists "orders: чтение вошедшим"    on orders;
drop policy if exists "orders: изменение вошедшим" on orders;
create policy "orders: чтение вошедшим"
  on orders for select to authenticated using (true);
create policy "orders: изменение вошедшим"
  on orders for update to authenticated using (true) with check (true);

-- ─────────────────────────────────────────────────────────────
-- Проверка: строк быть не должно.
-- Каждая строка здесь — дыра, через которую посетитель сайта
-- достаёт телефоны клиентов.
-- ─────────────────────────────────────────────────────────────

select policyname, roles
from pg_policies
where schemaname = 'public'
  and tablename = 'orders'
  and 'anon' = any (roles);
