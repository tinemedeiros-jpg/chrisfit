-- Adiciona bandeirinhas (flags) opcionais por item: Novo, Últimas unidades, Mais vendido.
-- Idempotente: pode rodar múltiplas vezes sem efeitos colaterais.

alter table public.products
  add column if not exists is_new boolean not null default false;

alter table public.products
  add column if not exists is_last_units boolean not null default false;

alter table public.products
  add column if not exists is_best_seller boolean not null default false;
