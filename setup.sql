-- Qahwatna setup. Paste ALL of this into Supabase > SQL Editor > Run.

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  description text,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  is_available boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.products (category_id, display_order);

-- Who is allowed to manage the menu
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- Row Level Security
alter table public.categories enable row level security;
alter table public.products   enable row level security;
alter table public.admins     enable row level security;

create policy "public reads active categories" on public.categories
  for select using (is_active = true);
create policy "public reads available products" on public.products
  for select using (
    is_available = true
    and exists (select 1 from public.categories c where c.id = category_id and c.is_active)
  );
create policy "admin manages categories" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin manages products" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin reads own row" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- Default categories
insert into public.categories (name, display_order) values
  ('مشاريب ساخنة', 1), ('مشاريب باردة', 2), ('شيشة', 3);

-- Image storage bucket (public read, admin-only write)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "public reads product images" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "admin uploads product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
create policy "admin updates product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and public.is_admin());
create policy "admin deletes product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());
