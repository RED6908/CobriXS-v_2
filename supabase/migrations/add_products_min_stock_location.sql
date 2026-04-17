-- Optional: add min_stock and location to products for inventory UI
alter table public.products
  add column if not exists min_stock integer default 10,
  add column if not exists location text;

comment on column public.products.min_stock is 'Stock mínimo antes de alerta';
comment on column public.products.location is 'Ubicación en almacén (ej. Pasillo A - Estante 1)';
