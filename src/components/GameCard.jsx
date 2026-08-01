export default function GameCard({ title, thumb, salePrice, normalPrice, savings, store, url, actions }) {
  return (
    <div className="game-card">
      <img src={thumb} alt="" />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
        {store && <div className="eyebrow" style={{ marginTop: 2 }}>{store}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <span className="game-card__price">${Number(salePrice).toFixed(2)}</span>
          {normalPrice > salePrice && (
            <span className="game-card__original">${Number(normalPrice).toFixed(2)}</span>
          )}
          {savings > 0.5 && <span className="game-card__discount">-{Math.round(savings)}%</span>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
        {url && <a className="btn btn--ghost" href={url} target="_blank" rel="noreferrer">View</a>}
        {actions}
      </div>
    </div>
  )
}
