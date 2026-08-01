import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Friends() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [incoming, setIncoming] = useState([])
  const [friends, setFriends] = useState([])

  async function loadFriendships() {
    const { data } = await supabase
      .from('friendships')
      .select('id, status, requester_id, addressee_id, requester:requester_id(username, avatar_url), addressee:addressee_id(username, avatar_url)')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

    setIncoming((data || []).filter(f => f.status === 'pending' && f.addressee_id === user.id))
    setFriends((data || []).filter(f => f.status === 'accepted'))
  }

  useEffect(() => { if (user) loadFriendships() }, [user])

  async function search(e) {
    e.preventDefault()
    if (!query.trim()) return
    const { data } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${query.trim()}%`)
      .neq('id', user.id)
      .limit(10)
    setSearchResults(data || [])
  }

  async function sendRequest(addresseeId) {
    await supabase.from('friendships').insert({ requester_id: user.id, addressee_id: addresseeId })
    setSearchResults(prev => prev.filter(p => p.id !== addresseeId))
  }

  async function respond(friendshipId, status) {
    await supabase.from('friendships').update({ status }).eq('id', friendshipId)
    loadFriendships()
  }

  return (
    <div>
      <div className="eyebrow">Find your squad</div>
      <h1>Friends</h1>

      <form onSubmit={search} style={{ display: 'flex', gap: 8, marginTop: 20 }}>
        <input style={{ flex: 1 }} placeholder="Search by username" value={query} onChange={e => setQuery(e.target.value)} />
        <button className="btn" type="submit">Search</button>
      </form>

      {searchResults.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3>Results</h3>
          {searchResults.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
              <img src={p.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${p.username}`} width={32} height={32} style={{ borderRadius: '50%' }} />
              <span style={{ flex: 1 }}>{p.username}</span>
              <button className="btn btn--ghost" onClick={() => sendRequest(p.id)}>Add friend</button>
            </div>
          ))}
        </div>
      )}

      {incoming.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3>Friend requests</h3>
          {incoming.map(f => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
              <img src={f.requester.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${f.requester.username}`} width={32} height={32} style={{ borderRadius: '50%' }} />
              <span style={{ flex: 1 }}>{f.requester.username}</span>
              <button className="btn" onClick={() => respond(f.id, 'accepted')}>Accept</button>
              <button className="btn btn--ghost" onClick={() => respond(f.id, 'declined')}>Decline</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <h3>Your friends ({friends.length})</h3>
        {friends.map(f => {
          const other = f.requester_id === user.id ? f.addressee : f.requester
          return (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
              <img src={other.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${other.username}`} width={32} height={32} style={{ borderRadius: '50%' }} />
              <span>{other.username}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
