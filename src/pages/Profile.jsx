import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Profile() {
  const { user, profile, setProfile } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function uploadAvatar(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const path = `${user.id}/${Date.now()}-${file.name}`
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!upErr) {
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
      const { data: updated } = await supabase
        .from('profiles')
        .update({ avatar_url: pub.publicUrl })
        .eq('id', user.id)
        .select()
        .single()
      setProfile(updated)
    }
    setUploading(false)
  }

  async function saveProfile(e) {
    e.preventDefault()
    const { data: updated } = await supabase
      .from('profiles')
      .update({ display_name: displayName, bio })
      .eq('id', user.id)
      .select()
      .single()
    setProfile(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!profile) return null

  return (
    <div style={{ maxWidth: 420 }}>
      <div className="eyebrow">Your account</div>
      <h1>Profile</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 20 }}>
        <img
          src={profile.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.username}`}
          alt=""
          style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid var(--line)' }}
        />
        <label className="btn btn--ghost">
          {uploading ? 'Uploading…' : 'Change photo'}
          <input type="file" accept="image/*" onChange={uploadAvatar} style={{ display: 'none' }} />
        </label>
      </div>

      <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
        <div>
          <div className="eyebrow">Username</div>
          <div>{profile.username}</div>
        </div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Display name</div>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Bio</div>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ width: '100%' }} />
        </div>
        <button className="btn" type="submit">Save changes</button>
        {saved && <span style={{ color: 'var(--drop-green)', fontSize: 13 }}>Saved.</span>}
      </form>
    </div>
  )
}
