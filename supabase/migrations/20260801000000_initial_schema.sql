-- PROFILES (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

-- GAMES (catalog, populated from RAWG/CheapShark/IsThereAnyDeal)
create table public.games (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  title text not null,
  cover_url text,
  genre text,
  platforms text[],
  rawg_id text,
  created_at timestamptz default now()
);

-- PRICES (current price per store)
create table public.prices (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references public.games(id) on delete cascade,
  store text not null,
  current_price numeric,
  original_price numeric,
  discount_pct numeric,
  url text,
  last_checked timestamptz default now(),
  unique(game_id, store)
);

-- PRICE HISTORY (for trend charts / all-time-low)
create table public.price_history (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references public.games(id) on delete cascade,
  store text not null,
  price numeric not null,
  recorded_at timestamptz default now()
);

-- WISHLIST
create table public.wishlist (
  user_id uuid references public.profiles(id) on delete cascade,
  game_id uuid references public.games(id) on delete cascade,
  target_price numeric,
  notify_on_free boolean default true,
  added_at timestamptz default now(),
  primary key (user_id, game_id)
);

-- FRIENDSHIPS
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references public.profiles(id) on delete cascade,
  addressee_id uuid references public.profiles(id) on delete cascade,
  status text check (status in ('pending','accepted','declined','blocked')) default 'pending',
  created_at timestamptz default now(),
  unique(requester_id, addressee_id)
);

-- CONVERSATIONS (DMs and groups)
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  is_group boolean default false,
  name text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create table public.conversation_members (
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- NOTIFICATIONS LOG (dedupe price alerts)
create table public.notifications_sent (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  game_id uuid references public.games(id) on delete cascade,
  type text check (type in ('price_drop','free','target_hit')),
  sent_at timestamptz default now()
);

create index idx_prices_game on public.prices(game_id);
create index idx_price_history_game on public.price_history(game_id, recorded_at);
create index idx_messages_conversation on public.messages(conversation_id, created_at);
create index idx_friendships_users on public.friendships(requester_id, addressee_id);
