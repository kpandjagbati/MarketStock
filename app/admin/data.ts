"use server"

import prisma from "@/lib/prisma"
import { isAdminEmail } from "@/lib/admin"
import { currentUser } from "@clerk/nextjs/server"

async function requireAdmin() {
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress
  const role = user?.publicMetadata?.role

  if (role === "admin" || isAdminEmail(email)) {
    return { user, email: email as string }
  }

  throw new Error("Accès admin refusé")
}

export async function getAdminProducts() {
  await requireAdmin()

  const products = await prisma.product.findMany({
    include: {
      category: true,
      association: true,
    },
    orderBy: { updatedAt: "desc" },
  })

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    quantity: p.quantity,
    minQuantity: p.minQuantity,
    unit: p.unit,
    price: p.price,
    value: p.price * p.quantity,
    category: p.category?.name || "—",
    association: p.association?.name || "—",
    currency: p.association?.currency || "EUR",
    status:
      p.quantity === 0 ? "out" : p.quantity <= p.minQuantity ? "low" : "ok",
  }))
}

export async function getAdminTransactions() {
  await requireAdmin()

  const transactions = await prisma.transaction.findMany({
    include: {
      product: true,
      association: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return transactions.map((tx) => ({
    id: tx.id,
    type: tx.type,
    quantity: tx.quantity,
    productName: tx.product.name,
    unit: tx.product.unit,
    association: tx.association?.name || "—",
    beneficiary: tx.beneficiary,
    reason: tx.reason,
    createdAt: tx.createdAt,
  }))
}
