import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  writeBatch,
  type Unsubscribe
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { RequirementItem } from '@/types'

function getRequirementsCollection(profileId: string) {
  return collection(db, 'weddingProfiles', profileId, 'requirements')
}

// Berlangganan data berkas persyaratan secara real-time
export function subscribeRequirements(
  profileId: string,
  callback: (items: RequirementItem[]) => void,
  onError?: (error: any) => void
): Unsubscribe {
  const reqCol = collection(db, 'weddingProfiles', profileId, 'requirements')
  const q = query(reqCol, orderBy('createdAt', 'asc'))

  return onSnapshot(
    q,
    (snapshot) => {
      const items: RequirementItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          wedding_profile_id: profileId,
          title: data.title || '',
          category: data.category || 'custom',
          is_completed: Boolean(data.isCompleted),
          due_date: data.dueDate || null,
          notes: data.notes || null,
          is_default: Boolean(data.isDefault),
          created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }
      })
      callback(items)
    },
    (error) => {
      console.error('Error saat mendengarkan data berkas persyaratan:', error)
      if (onError) onError(error)
    }
  )
}

// Tambah berkas persyaratan baru
export async function createRequirement(
  profileId: string,
  item: {
    title: string
    category: 'kua' | 'civil_registry' | 'custom'
    due_date?: string | null
    notes?: string | null
  }
): Promise<string> {
  const reqCol = getRequirementsCollection(profileId)
  const newDocRef = doc(reqCol)

  await setDoc(newDocRef, {
    id: newDocRef.id,
    title: item.title,
    category: item.category,
    isCompleted: false,
    dueDate: item.due_date || null,
    notes: item.notes || null,
    isDefault: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })

  return newDocRef.id
}

// Toggle status penyelesaian berkas
export async function toggleRequirement(
  profileId: string,
  reqId: string,
  isCompleted: boolean
): Promise<void> {
  const docRef = doc(db, 'weddingProfiles', profileId, 'requirements', reqId)
  await updateDoc(docRef, {
    isCompleted,
    updatedAt: serverTimestamp()
  })
}

// Hapus berkas persyaratan
export async function deleteRequirement(profileId: string, reqId: string): Promise<void> {
  const docRef = doc(db, 'weddingProfiles', profileId, 'requirements', reqId)
  await deleteDoc(docRef)
}

// Batch seeder untuk inisialisasi awal berkas nikah saat onboarding
export async function seedRequirements(
  profileId: string,
  items: Array<{
    title: string
    category: 'kua' | 'civil_registry' | 'custom'
    notes?: string | null
    dueDate?: string | null
    isDefault?: boolean
  }>
): Promise<void> {
  const batch = writeBatch(db)
  const reqCol = getRequirementsCollection(profileId)

  items.forEach((item) => {
    const docRef = doc(reqCol)
    batch.set(docRef, {
      id: docRef.id,
      title: item.title,
      category: item.category,
      isCompleted: false,
      dueDate: item.dueDate || null,
      notes: item.notes || null,
      isDefault: item.isDefault ?? true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  })

  await batch.commit()
}
