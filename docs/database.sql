create table if not exists public.messages (
  id uuid primary key,
  author text not null check (char_length(author) between 1 and 60),
  content text not null check (char_length(content) between 1 and 400),
  created_at timestamptz not null default now()
);

create index if not exists messages_created_at_idx on public.messages (created_at desc);
