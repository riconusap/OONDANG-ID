import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  type Unsubscribe
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Vendor, VendorPayment, VendorCategory, VendorStatus } from '@/types'

function getVendorsCollection(profileId: string) {
  return collection(db, 'weddingProfiles', profileId, 'vendors')
}

// Berlangganan data vendor beserta embedded payments secara real-time
export function subscribeVendors(
  profileId: string,
  callback: (items: Vendor[]) => void,
  onError?: (error: any) => void
): Unsubscribe {
  const venCol = collection(db, 'weddingProfiles', profileId, 'vendors')
  const q = query(venCol, orderBy('createdAt', 'desc'))

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Vendor[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        const rawPayments = Array.isArray(data.payments) ? data.payments : []
        const payments: VendorPayment[] = rawPayments.map((p: any) => ({
          id: p.id || `pay-${Date.now()}`,
          vendor_id: docSnap.id,
          title: p.title || 'Pembayaran',
          amount: Number(p.amount) || 0,
          status: p.status === 'paid' ? 'paid' : 'pending',
          payment_date: p.paymentDate || p.payment_date || null,
          proof_file_url: p.proofFileUrl || p.proof_file_url || null,
          created_at: p.createdAt || new Date().toISOString()
        }))

        return {
          id: docSnap.id,
          wedding_profile_id: profileId,
          name: data.name || '',
          category: (data.category as VendorCategory) || 'other',
          contact_person: data.contactPerson || data.contact_person || null,
          contact_phone: data.contactPhone || data.contact_phone || null,
          status: (data.status as VendorStatus) || 'riset',
          is_locked: Boolean(data.isLocked ?? data.is_locked),
          notes: data.notes || null,
          payments,
          created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }
      })
      callback(items)
    },
    (error) => {
      console.error('Error saat mendengarkan data vendor:', error)
      if (onError) onError(error)
    }
  )
}

// Tambah mitra vendor baru
export async function createVendor(
  profileId: string,
  vendor: {
    name: string
    category: VendorCategory
    contact_person?: string | null
    contact_phone?: string | null
    status?: VendorStatus
    notes?: string | null
  }
): Promise<string> {
  const vCol = getVendorsCollection(profileId)
  const newDocRef = doc(vCol)

  await setDoc(newDocRef, {
    id: newDocRef.id,
    name: vendor.name,
    category: vendor.category,
    contactPerson: vendor.contact_person || null,
    contactPhone: vendor.contact_phone || null,
    status: vendor.status || 'riset',
    isLocked: false,
    notes: vendor.notes || null,
    payments: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })

  return newDocRef.id
}

// Pembaruan data vendor
export async function updateVendor(
  profileId: string,
  vendorId: string,
  updates: {
    name?: string
    category?: VendorCategory
    contact_person?: string | null
    contact_phone?: string | null
    status?: VendorStatus
    notes?: string | null
  }
): Promise<void> {
  const docRef = doc(db, 'weddingProfiles', profileId, 'vendors', vendorId)
  const payload: Record<string, any> = {
    updatedAt: serverTimestamp()
  }

  if (updates.name !== undefined) payload.name = updates.name
  if (updates.category !== undefined) payload.category = updates.category
  if (updates.contact_person !== undefined) payload.contactPerson = updates.contact_person
  if (updates.contact_phone !== undefined) payload.contactPhone = updates.contact_phone
  if (updates.status !== undefined) payload.status = updates.status
  if (updates.notes !== undefined) payload.notes = updates.notes

  await updateDoc(docRef, payload)
}

// Hapus vendor (dengan proteksi guard jika isLocked)
export async function deleteVendor(profileId: string, vendorId: string): Promise<void> {
  const docRef = doc(db, 'weddingProfiles', profileId, 'vendors', vendorId)
  const snap = await getDoc(docRef)
  if (snap.exists() && snap.data()?.isLocked) {
    throw new Error('Vendor bawaan sistem dilindungi dan tidak dapat dihapus.')
  }
  await deleteDoc(docRef)
}

// Tambah termin pembayaran ke embedded array payments vendor
export async function addPayment(
  profileId: string,
  vendorId: string,
  payment: {
    title: string
    amount: number
    status: 'pending' | 'paid'
    payment_date: string | null
  }
): Promise<void> {
  const docRef = doc(db, 'weddingProfiles', profileId, 'vendors', vendorId)
  const snap = await getDoc(docRef)
  if (!snap.exists()) throw new Error('Vendor tidak ditemukan.')

  const currentPayments = Array.isArray(snap.data()?.payments) ? snap.data()?.payments : []
  const newPaymentObj = {
    id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: payment.title,
    amount: Number(payment.amount),
    status: payment.status,
    paymentDate: payment.payment_date || null,
    createdAt: new Date().toISOString()
  }

  await updateDoc(docRef, {
    payments: [...currentPayments, newPaymentObj],
    updatedAt: serverTimestamp()
  })
}

// Ubah termin pembayaran
export async function updatePayment(
  profileId: string,
  vendorId: string,
  paymentId: string,
  updates: {
    title?: string
    amount?: number
    status?: 'pending' | 'paid'
    payment_date?: string | null
  }
): Promise<void> {
  const docRef = doc(db, 'weddingProfiles', profileId, 'vendors', vendorId)
  const snap = await getDoc(docRef)
  if (!snap.exists()) throw new Error('Vendor tidak ditemukan.')

  const currentPayments = Array.isArray(snap.data()?.payments) ? snap.data()?.payments : []
  const updatedPayments = currentPayments.map((p: any) => {
    if (p.id === paymentId) {
      return {
        ...p,
        title: updates.title !== undefined ? updates.title : p.title,
        amount: updates.amount !== undefined ? Number(updates.amount) : p.amount,
        status: updates.status !== undefined ? updates.status : p.status,
        paymentDate: updates.payment_date !== undefined ? updates.payment_date : p.paymentDate,
        updatedAt: new Date().toISOString()
      }
    }
    return p
  })

  await updateDoc(docRef, {
    payments: updatedPayments,
    updatedAt: serverTimestamp()
  })
}

// Hapus termin pembayaran
export async function deletePayment(
  profileId: string,
  vendorId: string,
  paymentId: string
): Promise<void> {
  const docRef = doc(db, 'weddingProfiles', profileId, 'vendors', vendorId)
  const snap = await getDoc(docRef)
  if (!snap.exists()) throw new Error('Vendor tidak ditemukan.')

  const currentPayments = Array.isArray(snap.data()?.payments) ? snap.data()?.payments : []
  const filtered = currentPayments.filter((p: any) => p.id !== paymentId)

  await updateDoc(docRef, {
    payments: filtered,
    updatedAt: serverTimestamp()
  })
}

// Seeder kartu vendor default terkunci oondang.id saat inisialisasi onboarding
export async function seedDefaultLockedVendor(profileId: string): Promise<void> {
  const vCol = getVendorsCollection(profileId)
  const docRef = doc(vCol, 'ven-locked-oondang')

  await setDoc(docRef, {
    id: docRef.id,
    name: 'oondang.id (Undangan Digital)',
    category: 'invitation',
    contactPerson: 'Tim Support oondang.id',
    contactPhone: '081299887766',
    status: 'terkontrak',
    isLocked: true,
    notes: 'Undangan digital premium oondang.id (Phase 2: Segera Hadir).',
    payments: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}
