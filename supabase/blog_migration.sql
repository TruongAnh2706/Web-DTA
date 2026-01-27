-- Create posts table (Idempotent)
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image text,
  author_id uuid references auth.users(id),
  is_published boolean default false,
  featured boolean default false,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.posts enable row level security;

-- Policies for posts
-- 1. Public read access
drop policy if exists "Public can view published posts" on public.posts;
create policy "Public can view published posts"
  on public.posts for select
  using (is_published = true);

-- 2. Admin full access
drop policy if exists "Admins can do everything" on public.posts;
create policy "Admins can do everything"
  on public.posts for all
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Create storage bucket for blog assets if not exists
insert into storage.buckets (id, name, public)
values ('blog-assets', 'blog-assets', true)
on conflict (id) do nothing;

-- Storage policies for blog-assets
-- 1. Public read access
drop policy if exists "Public can view blog assets" on storage.objects;
create policy "Public can view blog assets"
  on storage.objects for select
  using ( bucket_id = 'blog-assets' );

-- 2. Admin write access
drop policy if exists "Admins can upload blog assets" on storage.objects;
create policy "Admins can upload blog assets"
  on storage.objects for insert
  with check (
    bucket_id = 'blog-assets'
    and exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Admins can update blog assets" on storage.objects;
create policy "Admins can update blog assets"
  on storage.objects for update
  using (
    bucket_id = 'blog-assets'
    and exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Admins can delete blog assets" on storage.objects;
create policy "Admins can delete blog assets"
  on storage.objects for delete
  using (
    bucket_id = 'blog-assets'
    and exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );
