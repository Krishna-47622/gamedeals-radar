# GameDeals Radar

Cross-platform game price comparison + social layer for gamers: trending deals, wishlist with price-drop/free alerts, friends, and messaging (DMs + group chats).

## Stack
- **Frontend:** React + Vite
- **Backend/DB/Auth/Storage/Realtime:** Supabase (Postgres, RLS, Storage for avatars, Realtime for chat)
- **Price data:** [CheapShark API](https://www.cheapshark.com/api-docs) (free, no key required) — aggregates Steam, Epic, GOG, Humble, Fanatical, and more

## Live Supabase project
- Project ref: `fgovvrosspibxbqqnyzi`
- URL: `https://fgovvrosspibxbqqnyzi.supabase.co`
- Free tier, $0/month

## Local setup
```bash
npm install
cp .env.example .env   # already pre-filled with the live project's keys in this checkout
npm run dev
```

## Database schema
See `supabase/migrations/` for the full schema:
- `profiles`, `games`, `prices`, `price_history`
- `wishlist` (with `target_price` and `notify_on_free`)
- `friendships`, `conversations`, `conversation_members`, `messages`
- `notifications_sent` (dedupe log for alerts)

All tables have Row Level Security enabled — users can only see their own wishlist, friendships, and conversations they're a member of. `avatars` storage bucket is public-read, owner-write.

## What's built
- Email/password auth with profile creation
- Trending deals feed (live from CheapShark, sorted by deal rating)
- Compare prices — search any title, see it across every store
- Wishlist — add games, see live current price, remove
- Friends — search by username, send/accept requests
- Messages — 1:1 DMs and group chats, realtime via Supabase Realtime
- Profile — display name, bio, avatar upload to Supabase Storage

## Not yet built (next steps)
- **Background price-check job**: a scheduled function (Supabase Edge Function + `pg_cron`, or an external cron) that polls CheapShark for each wishlisted game daily, writes to `price_history`, and inserts rows into `notifications_sent` + sends email when `target_price` is hit or a game goes free. The tables and dedupe log already exist — this just needs the job itself.
- **Email delivery** for those notifications (e.g. Resend or Supabase's SMTP integration).
- **Trending page pagination / filters** by platform or genre.
- **Group chat creation UI** (schema supports it; only DMs have a "start chat" button right now).
