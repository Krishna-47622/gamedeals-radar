import { useEffect, useState } from 'react'
import { getTrendingDeals, getStores } from '../lib/dealsApi'
import GameCard from '../components/GameCard.jsx'
import { addToWishlist } from '../lib/wishlist'

export default function Trending() {
  const [deals, setDeals] = useState([])
  const [stores, setStores] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getTrendingDeals({ pageSize: 30 }), getStores()])
      .then(([d, s]) => { setDeals(d); setStores(s) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="eyebrow">Live from CheapShark</div>
      <h1>Trending deals</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 0 }}>
        Best current discounts across every major store, ranked by deal rating.
      </p>

      {loading && <p>Loading deals…</p>}

      <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
        {deals.map(d => (
          <GameCard
            key={d.dealID}
            title={d.title}
            thumb={d.thumb}
            salePrice={d.salePrice}
            normalPrice={d.normalPrice}
            savings={d.savings}
            store={stores[d.storeID]?.storeName}
            url={`https://www.cheapshark.com/redirect?dealID=${d.dealID}`}
            actions={
              <button
                className="btn"
                onClick={() => addToWishlist({ external_id: d.gameID, title: d.title, cover_url: d.thumb })}
              >
                + Wishlist
              </button>
            }
          />
        ))}
      </div>
    </div>
  )
}
