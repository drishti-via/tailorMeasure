import { useState, useEffect } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  setDoc,
  doc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

export function useCollection(path) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!path) return
    return onSnapshot(collection(db, path), (snap) => {
      setDocs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [path])

  return { docs, loading }
}

export async function addDocument(path, data) {
  return addDoc(collection(db, path), { ...data, createdAt: serverTimestamp() })
}

export async function setDocument(path, id, data) {
  return setDoc(doc(db, path, id), data, { merge: true })
}

export async function deleteDocument(path, id) {
  return deleteDoc(doc(db, path, id))
}
