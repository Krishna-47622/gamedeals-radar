import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Messages() {
  const { user } = useAuth()
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [friends, setFriends] = useState([])
  const bottomRef = useRef(null)

  async function loadConversations() {
    const { data: memberships } = await supabase
      .from('conversation_members')
      .select('conversation_id, conversations(id, is_group, name, conversation_members(user_id, profiles(username, avatar_url)))')
      .eq('user_id', user.id)
    setConversations((memberships || []).map(m => m.conversations))
  }

  async function loadFriendsForNewChat() {
    const { data } = await supabase
      .from('friendships')
      .select('requester_id, addressee_id, requester:requester_id(id, username), addressee:addressee_id(id, username)')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    setFriends((data || []).map(f => f.requester_id === user.id ? f.addressee : f.requester))
  }

  useEffect(() => { if (user) { loadConversations(); loadFriendsForNewChat() } }, [user])

  useEffect(() => {
    if (!conversationId) { setMessages([]); return }
    supabase.from('messages')
      .select('id, content, sender_id, created_at, profiles(username)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data || []))

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        payload => setMessages(prev => [...prev, payload.new]))
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [conversationId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function startDM(friendId) {
    const { data: convo, error } = await supabase
      .from('conversations')
      .insert({ is_group: false, created_by: user.id })
      .select('id')
      .single()
    if (error) return
    await supabase.from('conversation_members').insert([
      { conversation_id: convo.id, user_id: user.id },
      { conversation_id: convo.id, user_id: friendId },
    ])
    loadConversations()
    navigate(`/messages/${convo.id}`)
  }

  async function send(e) {
    e.preventDefault()
    if (!text.trim()) return
    await supabase.from('messages').insert({ conversation_id: conversationId, sender_id: user.id, content: text.trim() })
    setText('')
  }

  return (
    <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 100px)' }}>
      <div style={{ width: 240, borderRight: '1px solid var(--line)', paddingRight: 16, overflowY: 'auto' }}>
        <h3>Chats</h3>
        {conversations.map(c => {
          const label = c.is_group ? (c.name || 'Group chat') : (c.conversation_members.find(m => m.user_id !== user.id)?.profiles.username || 'DM')
          return (
            <div key={c.id} className="nav__link" style={{ cursor: 'pointer' }} onClick={() => navigate(`/messages/${c.id}`)}>
              {label}
            </div>
          )
        })}
        <h3 style={{ marginTop: 20 }}>Start a DM</h3>
        {friends.map(f => (
          <div key={f.id} className="nav__link" style={{ cursor: 'pointer' }} onClick={() => startDM(f.id)}>
            {f.username}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!conversationId && <p style={{ color: 'var(--text-muted)' }}>Select a chat or start a new DM.</p>}
        {conversationId && (
          <>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {messages.map(m => (
                <div key={m.id} style={{
                  alignSelf: m.sender_id === user.id ? 'flex-end' : 'flex-start',
                  background: m.sender_id === user.id ? 'var(--gold)' : 'var(--surface-raised)',
                  color: m.sender_id === user.id ? 'var(--ink)' : 'var(--text)',
                  padding: '8px 12px', borderRadius: 10, maxWidth: '60%',
                }}>
                  {m.content}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={send} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <input style={{ flex: 1 }} value={text} onChange={e => setText(e.target.value)} placeholder="Message…" />
              <button className="btn" type="submit">Send</button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
