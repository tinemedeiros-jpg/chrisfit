-- 1) Alterações na tabela products
alter table public.products
  add column if not exists default_color text;

alter table public.products
  add column if not exists disabled_colors text[] not null default '{}';

-- 2) Nova tabela para mídias por cor
create table if not exists public.product_color_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  color_hex text not null,
  position smallint not null,
  url text not null,
  created_at timestamptz not null default now(),
  constraint product_color_media_position_check check (position between 1 and 5),
  constraint product_color_media_hex_check check (color_hex ~* '^#[0-9A-F]{6}$'),
  constraint product_color_media_unique unique (product_id, color_hex, position)
);

create index if not exists product_color_media_product_idx
  on public.product_color_media(product_id);

create index if not exists product_color_media_product_color_idx
  on public.product_color_media(product_id, color_hex);
