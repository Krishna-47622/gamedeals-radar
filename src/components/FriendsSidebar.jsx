import { useState } from 'react'

const initialFriends = [
  { id: 1, name: 'CrimsonTiger67', status: 'Join · Resident Evil 4', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80', online: true, action: 'Join' },
  { id: 2, name: 'a1c4tr0z_sniper', status: 'Playing · Fortnite', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', online: true },
  { id: 3, name: 'IceDragon', status: 'Playing · ROBLOX', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', online: true },
  { id: 4, name: 'Bliizkriieg96', status: 'Join · EA Sports FC 24', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80', online: true, action: 'Join' },
  { id: 5, name: 'phoenix_rising', status: 'Join · Rocket League', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', online: true, action: 'Join' },
  { id: 6, name: 'neonNova', status: 'Playing · GTA V', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', online: true },
]

const recentGames = [
  { id: 1, title: 'Hitman World of Assas...', progress: 72, thumb: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=120&auto=format&fit=crop&q=80' },
  { id: 2, title: 'Forza Horizon 5', progress: 47, thumb: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=120&auto=format&fit=crop&q=80' },
  { id: 3, title: 'The Witcher 3 Wild Hunt', progress: 12, thumb: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=120&auto=format&fit=crop&q=80' },
  { id: 4, title: 'NBA 2K24', progress: 96, thumb: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=120&auto=format&fit=crop&q=80' },
]

export default function FriendsSidebar() {
  const [friends] = useState(initialFriends)

  return (
    <aside className="gv-friends-sidebar">
      {/* Friends Online Section */}
      <div className="gv-sidebar-section">
        <div className="gv-sidebar-section-header">
          <h3 className="gv-section-title">Friends online</h3>
          <button className="gv-action-icon-btn" title="Add Friend">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>

        <div className="gv-friends-list">
          {friends.map((friend) => (
            <div key={friend.id} className="gv-friend-item">
              <div className="gv-friend-avatar-wrap">
                <img src={friend.avatar} alt={friend.name} className="gv-friend-avatar" />
                <span className="gv-status-dot online"></span>
              </div>
              <div className="gv-friend-info">
                <span className="gv-friend-name">{friend.name}</span>
                <span className="gv-friend-status">{friend.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Played Section */}
      <div className="gv-sidebar-section" style={{ marginTop: 28 }}>
        <div className="gv-sidebar-section-header">
          <h3 className="gv-section-title">Recently played</h3>
          <button className="gv-action-icon-btn" title="More options">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
        </div>

        <div className="gv-recent-list">
          {recentGames.map((game) => (
            <div key={game.id} className="gv-recent-item">
              <img src={game.thumb} alt={game.title} className="gv-recent-thumb" />
              <div className="gv-recent-info">
                <div className="gv-recent-header">
                  <span className="gv-recent-title">{game.title}</span>
                  <span className="gv-recent-pct">{game.progress}%</span>
                </div>
                <div className="gv-progress-bar-bg">
                  <div
                    className="gv-progress-bar-fill"
                    style={{ width: `${game.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
