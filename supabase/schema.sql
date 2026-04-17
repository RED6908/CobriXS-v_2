-- =============================================
-- CobriXS POS - Schema completo
-- =============================================

-- =============================================
-- EXTENSIONES
-- =============================================
create extension if not exists "uuid-ossp";

-- =============================================
-- TABLA: user_profiles
-- Extiende auth.users con nombre y rol
-- =============================================
create table if not exists public.user_profiles (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null default '',
  role        text not null default 'vendedor' check (role in ('admin', 'vendedor')),
  created_at  timestamptz not null default now(),
  unique(user_id)
);

-- =============================================
-- TABLA: products
-- =============================================
create table if not exists public.products (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  code           text unique,
  category       text,
  stock          integer not null default 0,
  min_stock      integer default 10,
  max_stock      integer,
  location       text,
  unit           text default 'Pieza',
  product_type   text default 'Unidad',
  provider_id    uuid,
  purchase_price numeric(12,2),
  sale_price     numeric(12,2),
  created_at     timestamptz not null default now()
);

-- =============================================
-- TABLA: inventory_movements
-- Trazabilidad de entradas y salidas de stock
-- =============================================
create table if not exists public.inventory_movements (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.products(id) on delete cascade,
  type        text not null check (type in ('entrada', 'salida')),
  quantity    integer not null check (quantity > 0),
  description text,
  user_id     uuid references auth.users(id),
  created_at  timestamptz not null default now()
);

-- =============================================
-- TABLA: cash_sessions
-- Control de apertura y cierre de caja
-- =============================================
create table if not exists public.cash_sessions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id),
  opening_amount  numeric(12,2) not null default 0,
  closing_amount  numeric(12,2),
  opened_at       timestamptz not null default now(),
  closed_at       timestamptz,
  status          text not null default 'open' check (status in ('open', 'closed'))
);

-- =============================================
-- TABLA: sales
-- Cabecera de cada venta
-- =============================================
create table if not exists public.sales (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id),
  cash_session_id uuid references public.cash_sessions(id),
  total           numeric(12,2) not null,
  payment_method  text not null check (payment_method in ('efectivo', 'tarjeta', 'transferencia')),
  created_at      timestamptz not null default now()
);

-- =============================================
-- TABLA: sale_items
-- Detalle de productos por venta
-- =============================================
create table if not exists public.sale_items (
  id          uuid primary key default uuid_generate_v4(),
  sale_id     uuid not null references public.sales(id) on delete cascade,
  product_id  uuid not null references public.products(id),
  quantity    integer not null check (quantity > 0),
  price       numeric(12,2) not null
);

-- =============================================
-- TABLA: providers
-- =============================================
create table if not exists public.providers (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text,
  phone       text,
  rfc         text,
  contact     text,
  balance     numeric(12,2) not null default 0,
  created_at  timestamptz not null default now()
);

-- =============================================
-- TABLA: provider_payments
-- Pagos registrados a proveedores
-- =============================================
create table if not exists public.provider_payments (
  id              uuid primary key default uuid_generate_v4(),
  provider_id     uuid not null references public.providers(id) on delete cascade,
  cash_session_id uuid references public.cash_sessions(id),
  amount          numeric(12,2) not null check (amount > 0),
  description     text,
  created_at      timestamptz not null default now()
);

-- =============================================
-- TABLA: cash_movements
-- Entradas y salidas manuales del fondo de caja
-- =============================================
create table if not exists public.cash_movements (
  id              uuid primary key default uuid_generate_v4(),
  cash_session_id uuid references public.cash_sessions(id),
  type            text not null check (type in ('entrada', 'salida')),
  amount          numeric(12,2) not null check (amount > 0),
  description     text,
  created_at      timestamptz not null default now()
);

-- =============================================
-- TRIGGER: actualizar stock al crear inventory_movement
-- =============================================
create or replace function public.fn_update_stock_on_movement()
returns trigger as $$
begin
  if NEW.type = 'entrada' then
    update public.products
    set stock = stock + NEW.quantity
    where id = NEW.product_id;
  elsif NEW.type = 'salida' then
    update public.products
    set stock = stock - NEW.quantity
    where id = NEW.product_id;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_update_stock on public.inventory_movements;
create trigger trg_update_stock
  after insert on public.inventory_movements
  for each row execute function public.fn_update_stock_on_movement();

-- =============================================
-- TRIGGER: actualizar balance de proveedor al registrar pago
-- =============================================
create or replace function public.fn_update_provider_balance()
returns trigger as $$
begin
  update public.providers
  set balance = balance - NEW.amount
  where id = NEW.provider_id;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_provider_balance on public.provider_payments;
create trigger trg_provider_balance
  after insert on public.provider_payments
  for each row execute function public.fn_update_provider_balance();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table public.user_profiles      enable row level security;
alter table public.products           enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.cash_sessions      enable row level security;
alter table public.sales              enable row level security;
alter table public.sale_items         enable row level security;
alter table public.providers          enable row level security;
alter table public.provider_payments  enable row level security;
alter table public.cash_movements     enable row level security;

-- Políticas: usuarios autenticados pueden leer y escribir todo (ajustar por rol en producción)
create policy "auth_all" on public.user_profiles      for all using (auth.role() = 'authenticated');
create policy "auth_all" on public.products           for all using (auth.role() = 'authenticated');
create policy "auth_all" on public.inventory_movements for all using (auth.role() = 'authenticated');
create policy "auth_all" on public.cash_sessions      for all using (auth.role() = 'authenticated');
create policy "auth_all" on public.sales              for all using (auth.role() = 'authenticated');
create policy "auth_all" on public.sale_items         for all using (auth.role() = 'authenticated');
create policy "auth_all" on public.providers          for all using (auth.role() = 'authenticated');
create policy "auth_all" on public.provider_payments  for all using (auth.role() = 'authenticated');
create policy "auth_all" on public.cash_movements     for all using (auth.role() = 'authenticated');

-- =============================================
-- REALTIME: habilitar para tablas clave
-- =============================================
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.inventory_movements;
alter publication supabase_realtime add table public.sales;
alter publication supabase_realtime add table public.cash_sessions;
