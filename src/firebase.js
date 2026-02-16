import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, set, get } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyBPnwdxE91ujtDDfYUR9ghrqTf-rVMsXPo",
  authDomain: "wheresmy-app.firebaseapp.com",
  databaseURL: "https://wheresmy-app-default-rtdb.firebaseio.com",
  projectId: "wheresmy-app",
  storageBucket: "wheresmy-app.firebasestorage.app",
  messagingSenderId: "471176539355",
  appId: "1:471176539355:web:6a767a95eabca140bab0fe"
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

// Generate a random 6-character room code
export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No I/1/O/0 to avoid confusion
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// Get a reference to a room's items
function roomItemsRef(roomCode) {
  return ref(db, `rooms/${roomCode}/items`)
}

// Subscribe to room items in real-time. Returns an unsubscribe function.
export function subscribeToRoom(roomCode, callback, onError) {
  const itemsRef = roomItemsRef(roomCode)
  const unsubscribe = onValue(itemsRef, (snapshot) => {
    const data = snapshot.val()
    const items = data ? Object.values(data) : []
    items.sort((a, b) => b.updatedAt - a.updatedAt)
    callback(items)
  }, (error) => {
    console.error('Firebase subscription error:', error)
    if (onError) onError(error)
  })
  return unsubscribe
}

// Check if a room exists
export async function roomExists(roomCode) {
  const itemsRef = roomItemsRef(roomCode)
  const snapshot = await get(itemsRef)
  return snapshot.exists()
}

// Set all items in a room (used for seeding demo items)
export function setRoomItems(roomCode, items) {
  const itemsRef = roomItemsRef(roomCode)
  // Store as object keyed by item id for efficient updates
  const itemsObj = {}
  items.forEach(item => {
    itemsObj[item.id] = item
  })
  return set(itemsRef, itemsObj)
}

// Add or update a single item in a room
export function setItem(roomCode, item) {
  const itemRef = ref(db, `rooms/${roomCode}/items/${item.id}`)
  return set(itemRef, item)
}

// Delete an item from a room
export function deleteItemFromRoom(roomCode, itemId) {
  const itemRef = ref(db, `rooms/${roomCode}/items/${itemId}`)
  return set(itemRef, null)
}
