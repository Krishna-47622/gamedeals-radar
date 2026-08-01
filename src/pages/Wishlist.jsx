import { useEffect, useState } from 'react'
import { getWishlist, removeFromWishlist } from '../lib/wishlist'
import { compareGamePrices, isFree } from '../lib/dealsApi'
import GameCard from '../components/GameCard.jsx'

export default function Wishlist() {
  const [items, setItems] = useState([])
  const [prices, setPrices] = useState({}) // game_id -> best current deal
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const wl = await getWishlist()
    setItems(wl)
    // For each wishlisted game, pull its current best price live
    const priceMap = {}
    await Promise.all(wl.map(async (item) => {
      const results = await compareGamePrices(item.games.title)
      if (results.length) priceMap[item.game_id] = results[0]
    }))
    setPrices(priceMap)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="eyebrow">Your saved games</div>
      <h1>Wishlist</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 0 }}>
        We check these daily and notify you on price drops or when they go free.
      </p>

      {loading && <p>Loading…</p>}
      {!loading && items.length === 0 && (
        <p style={{ color: 'var(--text-muted)' }}>Nothing here yet — add games from Trending or Compare Prices.</p>
      )}

      <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
        {items.map(item => {
          const best = prices[item.game_id]
          const free = best && isFree(best)
          return (
            <GameCard
              key={item.game_id}
              title={item.games.title}
              thumb={item.games.cover_url}
              salePrice={best?.salePrice ?? '—'}
              normalPrice={best?.normalPrice ?? 0}
              savings={best?.savings ?? 0}
              store={free ? 'FREE RIGHT NOW 🎉' : best?.store}
              url={best?.url}
              actions={
                <button className="btn btn--ghost" onClick={async () => { await removeFromWishlist(item.game_id); load() }}>
                  Remove
                </button>
              }
            />
          )
        })}
      </div>
    </div>
  )
}
