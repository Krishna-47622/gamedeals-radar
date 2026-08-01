-- Fix: move profile creation into a security definer trigger so it runs
-- server-side regardless of session state (avoids RLS rejection when
-- email confirmation is enabled or before the session is established).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
begin
  base_username := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  final_username := base_username;
  begin
    insert into public.profiles (id, username) values (new.id, final_username);
  exception when unique_violation then
    -- username taken: append last 6 chars of the user's id to keep it unique
    final_username := base_username || '_' || right(new.id::text, 6);
    insert into public.profiles (id, username) values (new.id, final_username)
    on conflict (id) do nothing;
  end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles alter column username drop not null;
