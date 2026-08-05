"use client"

import { useEffect, useMemo, useState } from "react"
import { Receipt, Search } from "lucide-react"
import { getAdminTransactions } from "../data"

type TxRow = Awaited<ReturnType<typeof getAdminTransactions>>[number]

export default function AdminTransactionsPage() {
  const [rows, setRows] = useState<TxRow[]>([])
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "IN" | "OUT">("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminTransactions()
      .then(setRows)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((tx) => {
      const matchesType = typeFilter === "all" || tx.type === typeFilter
      const matchesSearch =
        !q ||
        tx.productName.toLowerCase().includes(q) ||
        tx.association.toLowerCase().includes(q) ||
        (tx.beneficiary || "").toLowerCase().includes(q) ||
        (tx.reason || "").toLowerCase().includes(q)
      return matchesType && matchesSearch
    })
  }, [rows, search, typeFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-warning/15 text-warning p-3 rounded-xl">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Transactions</h1>
            <p className="text-sm opacity-60">Historique global (200 dernières)</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <label className="input input-bordered flex items-center gap-2 w-full md:max-w-xs">
            <Search className="w-4 h-4 opacity-60" />
            <input
              className="grow"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <select
            className="select select-bordered"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "all" | "IN" | "OUT")}
          >
            <option value="all">Tous</option>
            <option value="IN">Entrées</option>
            <option value="OUT">Sorties</option>
          </select>
        </div>
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
                <th>Date</th>
                <th>Type</th>
                <th>Produit</th>
                <th>Qté</th>
                <th>Association</th>
                <th>Bénéficiaire</th>
                <th>Motif</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id}>
                  <td>{new Date(tx.createdAt).toLocaleString("fr-FR")}</td>
                  <td>
                    <span
                      className={`badge badge-sm ${
                        tx.type === "IN" ? "badge-success" : "badge-error"
                      }`}
                    >
                      {tx.type === "IN" ? "Entrée" : "Sortie"}
                    </span>
                  </td>
                  <td className="font-medium">{tx.productName}</td>
                  <td>
                    {tx.quantity} {tx.unit}
                  </td>
                  <td>{tx.association}</td>
                  <td>{tx.beneficiary || "—"}</td>
                  <td className="max-w-xs truncate">{tx.reason || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
