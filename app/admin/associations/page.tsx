"use client"

import { useEffect, useState } from "react"
import { getAdminOverview } from "../actions"
import { formatMoney } from "@/lib/format"
import { Building2 } from "lucide-react"

type Overview = Awaited<ReturnType<typeof getAdminOverview>>

export default function AdminAssociationsPage() {
  const [rows, setRows] = useState<Overview["associationStats"]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminOverview()
      .then((data) => setRows(data.associationStats))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/15 text-primary p-3 rounded-xl">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Associations</h1>
          <p className="text-sm opacity-60">Toutes les organisations inscrites</p>
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
                <th>Nom</th>
                <th>Email</th>
                <th>Devise</th>
                <th>Produits</th>
                <th>Transactions</th>
                <th>Valeur stock</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td className="font-medium">{a.name}</td>
                  <td>{a.email}</td>
                  <td>{a.currency}</td>
                  <td>{a.products}</td>
                  <td>{a.transactions}</td>
                  <td>{formatMoney(a.stockValue, a.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
