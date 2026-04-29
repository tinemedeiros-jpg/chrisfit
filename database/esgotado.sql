-- Adiciona flag de esgotado por item.
-- Idempotente: pode rodar múltiplas vezes sem efeitos colaterais.

alter table public.products
  add column if not exists is_esgotado boolean not null default false;
