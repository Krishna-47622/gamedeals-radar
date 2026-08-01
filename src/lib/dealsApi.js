const BASE = import.meta.env.VITE_CHEAPSHARK_BASE || 'https://www.cheapshark.com/api/1.0'
const RAWG_BASE = 'https://api.rawg.io/api'
const RAWG_KEY = import.meta.env.VITE_RAWG_API_KEY || ''

let storesCache = null
export async function getStores() {
  if (storesCache) return storesCache
  const res = await fetch(`${BASE}/stores`)
  const data = await res.json()
  storesCache = Object.fromEntries(data.map(s => [s.storeID, s]))
  return storesCache
}

export function groupDealsByGame(rawDeals, storeMap = {}) {
  const byGame = new Map()

  for (const d of rawDeals) {
    const existing = byGame.get(d.gameID)
    const offer = {
      dealID:      d.dealID,
      storeID:     d.storeID,
      store:       storeMap[d.storeID]?.storeName || `Store ${d.storeID}`,
      salePrice:   parseFloat(d.salePrice),
      normalPrice: parseFloat(d.normalPrice),
      savings:     parseFloat(d.savings),
      url:         `https://www.cheapshark.com/redirect?dealID=${d.dealID}`,
    }

    if (!existing) {
      byGame.set(d.gameID, {
        gameID:      d.gameID,
        title:       d.title,
        thumb:       d.thumb,
        dealRating:  parseFloat(d.dealRating || 0),
        releaseDate: d.releaseDate,
        dealID:      d.dealID,
        storeID:     d.storeID,
        store:       offer.store,
        salePrice:   offer.salePrice,
        normalPrice: offer.normalPrice,
        savings:     offer.savings,
        url:         offer.url,
        allOffers:   [offer],
      })
    } else {
      existing.allOffers.push(offer)
      if (offer.salePrice < existing.salePrice) {
        existing.dealID      = offer.dealID
        existing.storeID     = offer.storeID
        existing.store       = offer.store
        existing.salePrice   = offer.salePrice
        existing.normalPrice = offer.normalPrice
        existing.savings     = offer.savings
        existing.url         = offer.url
      }
    }
  }

  for (const g of byGame.values()) {
    g.allOffers.sort((a, b) => a.salePrice - b.salePrice)
  }

  return Array.from(byGame.values())
}

export async function getTrendingDeals({ pageSize = 20, sortBy = 'Deal Rating' } = {}) {
  const res = await fetch(
    `${BASE}/deals?pageSize=${Math.min(pageSize * 3, 60)}&sortBy=${encodeURIComponent(sortBy)}&onSale=1`
  )
  const raw = await res.json()
  const stores = await getStores()
  const grouped = groupDealsByGame(raw, stores)
  return grouped.slice(0, pageSize)
}

export async function compareGamePrices(title) {
  const res = await fetch(`${BASE}/deals?title=${encodeURIComponent(title)}&pageSize=40`)
  const deals = await res.json()
  const stores = await getStores()
  return deals.map(d => ({
    gameId:      d.gameID,
    title:       d.title,
    thumb:       d.thumb,
    store:       stores[d.storeID]?.storeName || `Store ${d.storeID}`,
    storeId:     d.storeID,
    salePrice:   parseFloat(d.salePrice),
    normalPrice: parseFloat(d.normalPrice),
    savings:     parseFloat(d.savings),
    dealID:      d.dealID,
    url:         `https://www.cheapshark.com/redirect?dealID=${d.dealID}`,
  })).sort((a, b) => a.salePrice - b.salePrice)
}

export function isFree(deal) {
  return deal.salePrice === 0 || deal.savings >= 99.99
}

export async function getCatalog({
  page = 0,
  pageSize = 24,
  sortBy = 'Deal Rating',
  storeID = '',
  upperPrice = 70,
  lowerPrice = 0,
  onSale = false,
  freeOnly = false,
  minSavings = 0,
  title = '',
} = {}) {
  const fetchSize = Math.min(pageSize * 3, 60)

  const params = new URLSearchParams({
    pageNumber: page,
    pageSize: fetchSize,
    sortBy: encodeURIComponent(sortBy),
    ...(storeID && { storeID }),
    ...(upperPrice < 70 && { upperPrice }),
    ...(lowerPrice > 0 && { lowerPrice }),
    ...(onSale && { onSale: 1 }),
    ...(freeOnly && { upperPrice: 0 }),
    ...(minSavings > 0 && { lowerPrice: 0, onSale: 1 }),
    ...(title && { title: encodeURIComponent(title) }),
  })

  const res = await fetch(`${BASE}/deals?${params.toString()}`)
  const raw = await res.json()
  const stores = await getStores()

  const grouped = groupDealsByGame(raw, stores)

  return grouped
    .filter(g => minSavings === 0 || g.savings >= minSavings)
    .slice(0, pageSize)
}

export async function getGameOffers(gameId) {
  const res = await fetch(`${BASE}/deals?gameID=${gameId}&pageSize=60`)
  const raw = await res.json()
  const stores = await getStores()
  return raw.map(d => ({
    dealID:      d.dealID,
    gameID:      d.gameID,
    title:       d.title,
    thumb:       d.thumb,
    store:       stores[d.storeID]?.storeName || `Store ${d.storeID}`,
    storeID:     d.storeID,
    salePrice:   parseFloat(d.salePrice),
    normalPrice: parseFloat(d.normalPrice),
    savings:     parseFloat(d.savings),
    dealRating:  parseFloat(d.dealRating || 0),
    url:         `https://www.cheapshark.com/redirect?dealID=${d.dealID}`,
  })).sort((a, b) => a.salePrice - b.salePrice)
}

export async function getGameDetails(gameId) {
  try {
    const res = await fetch(`${BASE}/games?id=${gameId}`)
    const data = await res.json()
    return data
  } catch (err) {
    console.error('Error fetching game details:', err)
    return null
  }
}

const rawgCache = new Map()
export async function getRawgCover(title) {
  if (!RAWG_KEY) return null
  if (rawgCache.has(title)) return rawgCache.get(title)
  try {
    const res = await fetch(
      `${RAWG_BASE}/games?search=${encodeURIComponent(title)}&page_size=1&key=${RAWG_KEY}`
    )
    const data = await res.json()
    const img = data.results?.[0]?.background_image || null
    rawgCache.set(title, img)
    return img
  } catch {
    return null
  }
}

export async function getRawgDetails(title) {
  if (!RAWG_KEY) return null
  try {
    const res = await fetch(
      `${RAWG_BASE}/games?search=${encodeURIComponent(title)}&page_size=1&key=${RAWG_KEY}`
    )
    const data = await res.json()
    const g = data.results?.[0]
    if (!g) return null
    return {
      cover:      g.background_image,
      rating:     g.rating,
      ratingTop:  g.rating_top,
      metacritic: g.metacritic,
      genres:     g.genres?.map(x => x.name) || [],
      platforms:  g.platforms?.map(x => x.platform.name) || [],
      released:   g.released,
    }
  } catch {
    return null
  }
}
