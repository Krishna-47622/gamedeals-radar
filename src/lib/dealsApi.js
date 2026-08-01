const BASE = import.meta.env.VITE_CHEAPSHARK_BASE || 'https://www.cheapshark.com/api/1.0'

let storesCache = null
export async function getStores() {
  if (storesCache) return storesCache
  const res = await fetch(`${BASE}/stores`)
  const data = await res.json()
  storesCache = Object.fromEntries(data.map(s => [s.storeID, s]))
  return storesCache
}

// Top trending / best current deals across all stores
export async function getTrendingDeals({ pageSize = 20, sortBy = 'Deal Rating' } = {}) {
  const res = await fetch(`${BASE}/deals?pageSize=${pageSize}&sortBy=${encodeURIComponent(sortBy)}&onSale=1`)
  return res.json()
}

// Search a title and compare its price across every store that has it
export async function compareGamePrices(title) {
  const res = await fetch(`${BASE}/deals?title=${encodeURIComponent(title)}&pageSize=40`)
  const deals = await res.json()
  // Group by game (gameID), each entry already represents one store's listing
  const stores = await getStores()
  return deals.map(d => ({
    gameId: d.gameID,
    title: d.title,
    thumb: d.thumb,
    store: stores[d.storeID]?.storeName || `Store ${d.storeID}`,
    storeId: d.storeID,
    salePrice: parseFloat(d.salePrice),
    normalPrice: parseFloat(d.normalPrice),
    savings: parseFloat(d.savings),
    dealID: d.dealID,
    url: `https://www.cheapshark.com/redirect?dealID=${d.dealID}`,
  })).sort((a, b) => a.salePrice - b.salePrice)
}

// Free-games check: anything currently at 100% off
export function isFree(deal) {
  return deal.salePrice === 0 || deal.savings >= 99.99
}
