import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Vendor, VendorPayment, BudgetSummary } from '@/types'

// Pembaruan target anggaran pada dokumen induk profil pernikahan
export async function updateTargetBudget(profileId: string, targetBudget: number): Promise<void> {
  const profileDocRef = doc(db, 'weddingProfiles', profileId)
  await updateDoc(profileDocRef, {
    targetBudget: Number(targetBudget),
    updatedAt: serverTimestamp()
  })
}

// Agregasi metrik keuangan real-time dari data reaktif vendor & profil
export function calculateFinanceMetrics(
  targetBudget: number,
  vendors: Vendor[]
): BudgetSummary {
  let totalContracted = 0
  let totalPaid = 0

  vendors.forEach((v) => {
    const payments: VendorPayment[] = Array.isArray(v.payments) ? v.payments : []
    const vendorTotal = payments.reduce((acc: number, p: VendorPayment) => acc + (Number(p.amount) || 0), 0)

    if (v.status === 'terkontrak' || v.status === 'selesai') {
      totalContracted += vendorTotal
    }

    payments.forEach((p: VendorPayment) => {
      if (p.status === 'paid') {
        totalPaid += Number(p.amount) || 0
      }
    })
  })

  const remainingDebt = Math.max(0, totalContracted - totalPaid)
  const remainingBudget = Math.max(0, targetBudget - totalContracted)
  const percentageUsed = targetBudget > 0 ? Math.min(100, Math.round((totalContracted / targetBudget) * 100)) : 0

  return {
    target_budget: targetBudget,
    total_contracted: totalContracted,
    total_paid: totalPaid,
    remaining_debt: remainingDebt,
    remaining_budget: remainingBudget,
    percentage_used: percentageUsed
  }
}
