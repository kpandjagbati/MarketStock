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

export async function getAdminOverview() {
  await requireAdmin()

  const [associations, products, categories, transactions] = await Promise.all([
    prisma.association.findMany(),
    prisma.product.findMany({ include: { category: true, association: true } }),
    prisma.category.findMany(),
    prisma.transaction.findMany({
      include: {
        product: { include: { category: true } },
        association: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const stockValue = products.reduce((acc, p) => acc + p.price * p.quantity, 0)
  const inStock = products.filter((p) => p.quantity > p.minQuantity).length
  const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= p.minQuantity).length
  const outOfStock = products.filter((p) => p.quantity === 0).length
  const inTx = transactions.filter((t) => t.type === "IN").length
  const outTx = transactions.filter((t) => t.type === "OUT").length

  // Transactions last 30 days
  const days = 30
  const now = new Date()
  const dailyMap: Record<string, { date: string; in: number; out: number }> = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    dailyMap[key] = { date: key, in: 0, out: 0 }
  }
  for (const tx of transactions) {
    const key = new Date(tx.createdAt).toISOString().slice(0, 10)
    if (!dailyMap[key]) continue
    if (tx.type === "IN") dailyMap[key].in += tx.quantity
    else dailyMap[key].out += tx.quantity
  }

  // Category distribution
  const categoryCount: Record<string, number> = {}
  for (const p of products) {
    const name = p.category?.name || "Sans catégorie"
    categoryCount[name] = (categoryCount[name] || 0) + 1
  }
  const categoryDistribution = Object.entries(categoryCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  // Top products by stock value
  const topProducts = [...products]
    .map((p) => ({
      id: p.id,
      name: p.name,
      quantity: p.quantity,
      unit: p.unit,
      value: p.price * p.quantity,
      association: p.association?.name || "—",
      status:
        p.quantity === 0
          ? "out"
          : p.quantity <= p.minQuantity
            ? "low"
            : "ok",
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  const criticalProducts = products
    .filter((p) => p.quantity <= p.minQuantity)
    .map((p) => ({
      id: p.id,
      name: p.name,
      quantity: p.quantity,
      minQuantity: p.minQuantity,
      unit: p.unit,
      association: p.association?.name || "—",
      category: p.category?.name || "—",
    }))
    .slice(0, 10)

  const recentTransactions = transactions.slice(0, 10).map((tx) => ({
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

  const associationStats = associations.map((a) => {
    const assocProducts = products.filter((p) => p.associationId === a.id)
    const assocTx = transactions.filter((t) => t.associationId === a.id)
    return {
      id: a.id,
      name: a.name,
      email: a.email,
      currency: a.currency,
      products: assocProducts.length,
      transactions: assocTx.length,
      stockValue: assocProducts.reduce((acc, p) => acc + p.price * p.quantity, 0),
    }
  })

  return {
    totals: {
      associations: associations.length,
      products: products.length,
      categories: categories.length,
      transactions: transactions.length,
      stockValue,
      inStock,
      lowStock,
      outOfStock,
      inTx,
      outTx,
    },
    dailyMovements: Object.values(dailyMap),
    categoryDistribution,
    topProducts,
    criticalProducts,
    recentTransactions,
    associationStats,
    stockStatus: [
      { name: "Normal", value: inStock },
      { name: "Faible", value: lowStock },
      { name: "Rupture", value: outOfStock },
    ],
  }
}

export async function checkIsAdmin(): Promise<boolean> {
  try {
    const user = await currentUser()
    const email = user?.primaryEmailAddress?.emailAddress
    const role = user?.publicMetadata?.role
    return role === "admin" || isAdminEmail(email)
  } catch {
    return false
  }
}
