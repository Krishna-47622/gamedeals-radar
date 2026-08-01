import { useEffect, useState } from 'react'
import { getTrendingDeals } from '../lib/dealsApi'

export default function DealTicker() {
  const [deals, setDeals] = useState([])

  useEffect(() => {
    getTrendingDeals({ pageSize: 15 }).then(setDeals).catch(() => setDeals([]))
  }, [])

  if (!deals.length) return <div className="deal-ticker" />

  const items = [...deals, ...deals] // duplicate for seamless loop

  return (
    <div className="deal-ticker">
      <div className="deal-ticker__track">
        {items.map((d, i) => (
          <span className="deal-ticker__item" key={i}>
            {d.title} <strong>${parseFloat(d.salePrice).toFixed(2)}</strong>{' '}
            <span style={{ color: 'var(--drop-green)' }}>(-{Math.round(d.savings)}%)</span>
          </span>
        ))}
      </div>
    </div>
  )
}
