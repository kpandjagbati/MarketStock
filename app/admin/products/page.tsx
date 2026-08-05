"use client"

import { useEffect, useMemo, useState } from "react"
import { formatMoney } from "@/lib/format"
import { Package, Search } from "lucide-react"
import { getAdminProducts } from "../data"

type ProductRow = Awaited<ReturnType<typeof getAdminProducts>>[number]

export default function AdminProductsPage() {
  const [rows, setRows] = useState<ProductRow[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminProducts()
      .then(setRows)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.association.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    )
  }, [rows, search])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-info/15 text-info p-3 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Tous les produits</h1>
            <p className="text-sm opacity-60">Inventaire global</p>
          </div>
        </div>
        <label className="input input-bordered flex items-center gap-2 w-full md:max-w-xs">
          <Search className="w-4 h-4 opacity-60" />
          <input
            className="grow"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : (
        <div className="bg-base-100 border border-base-200 rounded-2xl overflow-x-auto shadow-sm">
          <table className="table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Association</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Qté</th>
                <th>Seuil</th>
                <th>Statut</th>
                <th>Valeur</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium">{p.name}</td>
                  <td>{p.association}</td>
                  <td>{p.category}</td>
                  <td>{formatMoney(p.price, p.currency)}</td>
                  <td>
                    {p.quantity} {p.unit}
                  </td>
                  <td>{p.minQuantity}</td>
                  <td>
                    <span
                      className={`badge badge-sm ${
                        p.status === "out"
                          ? "badge-error"
                          : p.status === "low"
                            ? "badge-warning"
                            : "badge-success"
                      }`}
                    >
                      {p.status === "out" ? "Rupture" : p.status === "low" ? "Faible" : "OK"}
                    </span>
                  </td>
                  <td>{formatMoney(p.value, p.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
