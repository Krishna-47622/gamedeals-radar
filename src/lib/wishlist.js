import { supabase } from './supabaseClient'

// Ensure the game exists in our catalog, then add it to the current user's wishlist
export async function addToWishlist({ external_id, title, cover_url }, opts = {}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  let { data: game } = await supabase
    .from('games')
    .select('id')
    .eq('external_id', String(external_id))
    .maybeSingle()

  if (!game) {
    const { data: inserted, error } = await supabase
      .from('games')
      .insert({ external_id: String(external_id), title, cover_url })
      .select('id')
      .single()
    if (error) throw error
    game = inserted
  }

  const { error: wishErr } = await supabase.from('wishlist').upsert({
    user_id: user.id,
    game_id: game.id,
    target_price: opts.targetPrice ?? null,
    notify_on_free: opts.notifyOnFree ?? true,
  })
  if (wishErr) throw wishErr
  return game.id
}

export async function removeFromWishlist(gameId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('wishlist').delete().eq('user_id', user.id).eq('game_id', gameId)
}

export async function getWishlist() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('wishlist')
    .select('game_id, target_price, notify_on_free, added_at, games(id, title, cover_url, external_id)')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false })
  if (error) throw error
  return data
}
