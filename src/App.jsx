import { useState, useEffect } from 'react'
import './App.css'

const STORAGE_KEY = 'wheresmy-items'

const DEMO_ITEMS = [
  { id: 1, name: 'Keys', icon: '🔑', location: 'Front door hook', updatedAt: Date.now() - 1000 * 60 * 12, history: [{ location: 'Front door hook', timestamp: Date.now() - 1000 * 60 * 12 }, { location: 'Kitchen counter', timestamp: Date.now() - 1000 * 60 * 60 * 26 }] },
  { id: 2, name: 'Wallet', icon: '👛', location: 'Purse', updatedAt: Date.now() - 1000 * 60 * 45, history: [{ location: 'Purse', timestamp: Date.now() - 1000 * 60 * 45 }] },
  { id: 3, name: 'Headphones', icon: '🎧', location: 'Nightstand', updatedAt: Date.now() - 1000 * 60 * 60 * 3, history: [{ location: 'Nightstand', timestamp: Date.now() - 1000 * 60 * 60 * 3 }, { location: 'Desk', timestamp: Date.now() - 1000 * 60 * 60 * 8 }, { location: 'Couch', timestamp: Date.now() - 1000 * 60 * 60 * 30 }] },
  { id: 4, name: 'Glasses', icon: '👓', location: 'Bathroom', updatedAt: Date.now() - 1000 * 60 * 60 * 5, history: [{ location: 'Bathroom', timestamp: Date.now() - 1000 * 60 * 60 * 5 }, { location: 'Nightstand', timestamp: Date.now() - 1000 * 60 * 60 * 18 }] },
  { id: 5, name: 'Charger', icon: '🔌', location: 'Desk', updatedAt: Date.now() - 1000 * 60 * 60 * 7, history: [{ location: 'Desk', timestamp: Date.now() - 1000 * 60 * 60 * 7 }] },
  { id: 6, name: 'Water bottle', icon: '🥤', location: 'Car', updatedAt: Date.now() - 1000 * 60 * 60 * 24, history: [{ location: 'Car', timestamp: Date.now() - 1000 * 60 * 60 * 24 }, { location: 'Kitchen counter', timestamp: Date.now() - 1000 * 60 * 60 * 48 }] },
]

function loadItems() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    const parsed = data ? JSON.parse(data) : null
    if (parsed && parsed.length > 0) return parsed
    // Seed with demo items on first visit
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_ITEMS))
    return DEMO_ITEMS
  } catch {
    return []
  }
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const ITEM_ICONS = {
  keys: '🔑', key: '🔑',
  wallet: '👛', purse: '👜',
  phone: '📱', headphones: '🎧',
  glasses: '👓', sunglasses: '🕶️',
  charger: '🔌', cable: '🔌',
  'water bottle': '🥤', bottle: '🍼',
  badge: '🪪', id: '🪪',
  laptop: '💻', computer: '💻',
  watch: '⌚', ring: '💍',
  umbrella: '☂️', jacket: '🧥',
  bag: '👜', backpack: '🎒',
  remote: '📺', book: '📖',
  medicine: '💊', inhaler: '💨',
}

function getItemIcon(name) {
  const lower = name.toLowerCase()
  for (const [key, icon] of Object.entries(ITEM_ICONS)) {
    if (lower.includes(key)) return icon
  }
  return '📦'
}

const SUGGESTED_ITEMS = [
  { name: 'Keys', icon: '🔑' },
  { name: 'Wallet', icon: '👛' },
  { name: 'Phone', icon: '📱' },
  { name: 'Glasses', icon: '👓' },
  { name: 'Headphones', icon: '🎧' },
  { name: 'Charger', icon: '🔌' },
  { name: 'Water bottle', icon: '🥤' },
  { name: 'Badge', icon: '🪪' },
]

const SUGGESTED_LOCATIONS = ['Kitchen counter', 'Nightstand', 'Couch', 'Front door hook', 'Purse', 'Car', 'Desk', 'Bathroom']

function App() {
  const [items, setItems] = useState(loadItems)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('home')
  const [selectedItem, setSelectedItem] = useState(null)
  const [newName, setNewName] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [editingLocation, setEditingLocation] = useState(false)
  const [editLocation, setEditLocation] = useState('')

  useEffect(() => {
    saveItems(items)
  }, [items])

  const addItem = () => {
    if (!newName.trim() || !newLocation.trim()) return
    const item = {
      id: Date.now(),
      name: newName.trim(),
      icon: getItemIcon(newName),
      location: newLocation.trim(),
      updatedAt: Date.now(),
      history: [{ location: newLocation.trim(), timestamp: Date.now() }],
    }
    setItems(prev => [item, ...prev])
    setNewName('')
    setNewLocation('')
    setView('home')
  }

  const updateLocation = (id) => {
    if (!editLocation.trim()) return
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              location: editLocation.trim(),
              updatedAt: Date.now(),
              history: [
                { location: editLocation.trim(), timestamp: Date.now() },
                ...item.history,
              ],
            }
          : item
      )
    )
    setSelectedItem(prev => ({
      ...prev,
      location: editLocation.trim(),
      updatedAt: Date.now(),
      history: [
        { location: editLocation.trim(), timestamp: Date.now() },
        ...prev.history,
      ],
    }))
    setEditingLocation(false)
    setEditLocation('')
  }

  const deleteItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id))
    setView('home')
    setSelectedItem(null)
  }

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.location.toLowerCase().includes(search.toLowerCase())
  )

  // --- ADD VIEW ---
  if (view === 'add') {
    return (
      <div className="app">
        <header className="app-header">
          <button className="back-btn" onClick={() => setView('home')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h1>Add Item</h1>
          <div style={{ width: 38 }} />
        </header>
        <main className="add-form">
          <label>What's the item?</label>
          <input
            type="text"
            placeholder="e.g. Keys, Wallet..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            autoFocus
          />
          <div className="suggestions">
            {SUGGESTED_ITEMS
              .filter(s => !items.some(i => i.name.toLowerCase() === s.name.toLowerCase()))
              .slice(0, 4)
              .map(s => (
                <button key={s.name} className="chip" onClick={() => setNewName(s.name)}>
                  {s.icon} {s.name}
                </button>
              ))}
          </div>

          <label>Where did you put it?</label>
          <input
            type="text"
            placeholder="e.g. Kitchen counter..."
            value={newLocation}
            onChange={e => setNewLocation(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
          />
          <div className="suggestions">
            {SUGGESTED_LOCATIONS.slice(0, 4).map(s => (
              <button key={s} className="chip" onClick={() => setNewLocation(s)}>{s}</button>
            ))}
          </div>

          <button
            className="primary-btn"
            onClick={addItem}
            disabled={!newName.trim() || !newLocation.trim()}
          >
            Save Item
          </button>
        </main>
      </div>
    )
  }

  // --- DETAIL VIEW ---
  if (view === 'detail' && selectedItem) {
    const item = items.find(i => i.id === selectedItem.id) || selectedItem
    return (
      <div className="app">
        <header className="app-header">
          <button className="back-btn" onClick={() => { setView('home'); setEditingLocation(false) }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h1>{item.icon || getItemIcon(item.name)} {item.name}</h1>
          <div style={{ width: 38 }} />
        </header>
        <main className="detail">
          <div className="current-location-card">
            <span className="cl-label">Currently at</span>
            <span className="cl-location">{item.location}</span>
            <span className="cl-time">Updated {timeAgo(item.updatedAt)}</span>
          </div>

          {editingLocation ? (
            <div className="edit-section">
              <input
                type="text"
                placeholder="New location..."
                value={editLocation}
                onChange={e => setEditLocation(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && updateLocation(item.id)}
                autoFocus
              />
              <div className="suggestions">
                {SUGGESTED_LOCATIONS.slice(0, 4).map(s => (
                  <button key={s} className="chip" onClick={() => setEditLocation(s)}>{s}</button>
                ))}
              </div>
              <div className="edit-actions">
                <button className="primary-btn" onClick={() => updateLocation(item.id)} disabled={!editLocation.trim()}>
                  Update
                </button>
                <button className="secondary-btn" onClick={() => setEditingLocation(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="primary-btn move-btn" onClick={() => { setEditingLocation(true); setEditLocation(item.location) }}>
              I moved it!
            </button>
          )}

          {item.history.length > 1 && (
            <div className="history">
              <h3>Location History</h3>
              <div className="timeline">
                {item.history.map((h, i) => (
                  <div key={i} className={`timeline-entry ${i === 0 ? 'current' : ''}`}>
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <span className="timeline-location">{h.location}</span>
                      <span className="timeline-time">{timeAgo(h.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="danger-btn" onClick={() => deleteItem(item.id)}>
            Remove Item
          </button>
        </main>
      </div>
    )
  }

  // --- HOME VIEW ---
  return (
    <div className="app">
      <header className="app-header home-header">
        <div>
          <h1>Where's My...?</h1>
          <p className="subtitle">Never lose your stuff again</p>
        </div>
      </header>
      <main>
        <div className="search-bar">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            placeholder="Search for an item..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="clear-btn" onClick={() => setSearch('')}>✕</button>}
        </div>

        {filtered.length === 0 && !search && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p className="empty-title">No items tracked yet</p>
            <p className="empty-hint">Tap the + button to start tracking!</p>
          </div>
        )}

        {filtered.length === 0 && search && (
          <div className="empty-state">
            <p className="empty-title">No items match "{search}"</p>
          </div>
        )}

        <div className="items-list">
          {filtered.map(item => (
            <button
              key={item.id}
              className="item-card"
              onClick={() => { setSelectedItem(item); setView('detail') }}
            >
              <div className="item-icon">
                {item.icon || getItemIcon(item.name)}
              </div>
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-location">{item.location}</span>
              </div>
              <span className="item-time">{timeAgo(item.updatedAt)}</span>
            </button>
          ))}
        </div>

        <button className="fab" onClick={() => setView('add')} aria-label="Add item">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </main>
    </div>
  )
}

export default App
