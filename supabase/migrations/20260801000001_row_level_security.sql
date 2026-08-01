alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.prices enable row level security;
alter table public.price_history enable row level security;
alter table public.wishlist enable row level security;
alter table public.friendships enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.notifications_sent enable row level security;

create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

create policy "games_select_all" on public.games for select using (true);
create policy "prices_select_all" on public.prices for select using (true);
create policy "price_history_select_all" on public.price_history for select using (true);

create policy "wishlist_select_own" on public.wishlist for select using (auth.uid() = user_id);
create policy "wishlist_insert_own" on public.wishlist for insert with check (auth.uid() = user_id);
create policy "wishlist_update_own" on public.wishlist for update using (auth.uid() = user_id);
create policy "wishlist_delete_own" on public.wishlist for delete using (auth.uid() = user_id);

create policy "friendships_select_own" on public.friendships for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);
create policy "friendships_insert_own" on public.friendships for insert
  with check (auth.uid() = requester_id);
create policy "friendships_update_own" on public.friendships for update
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "conversations_select_member" on public.conversations for select
  using (exists (select 1 from public.conversation_members cm where cm.conversation_id = id and cm.user_id = auth.uid()));
create policy "conversations_insert_own" on public.conversations for insert
  with check (auth.uid() = created_by);

create policy "members_select_own_convo" on public.conversation_members for select
  using (exists (select 1 from public.conversation_members cm2 where cm2.conversation_id = conversation_id and cm2.user_id = auth.uid()));
create policy "members_insert_own_convo" on public.conversation_members for insert
  with check (exists (select 1 from public.conversations c where c.id = conversation_id and c.created_by = auth.uid())
              or user_id = auth.uid());

create policy "messages_select_member" on public.messages for select
  using (exists (select 1 from public.conversation_members cm where cm.conversation_id = conversation_id and cm.user_id = auth.uid()));
create policy "messages_insert_member" on public.messages for insert
  with check (auth.uid() = sender_id and exists (select 1 from public.conversation_members cm where cm.conversation_id = conversation_id and cm.user_id = auth.uid()));

create policy "notifications_select_own" on public.notifications_sent for select using (auth.uid() = user_id);

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatar_public_read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatar_owner_upload" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "avatar_owner_update" on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
