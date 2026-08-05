"use client"

import { useEffect, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  AlertTriangle,
  Building2,
  Package,
  Receipt,
  Tags,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { getAdminOverview } from "./actions"
import { formatMoney } from "@/lib/format"

type Overview = Awaited<ReturnType<typeof getAdminOverview>>

const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444"]

function StatCard({
  title,
  value,
  icon: Icon,
  tone = "primary",
}: {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  tone?: "primary" | "success" | "warning" | "error" | "info"
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary/15 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    error: "bg-error/15 text-error",
    info: "bg-info/15 text-info",
  }

  return (
    <div className="bg-base-100 border border-base-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm opacity-60">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${tones[tone]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<Overview | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    getAdminOverview()
      .then(setData)
      .catch((e) => setError(e.message || "Erreur de chargement"))
  }, [])

  if (error) {
    return <div className="alert alert-error">{error}</div>
  }

  if (!data) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  const { totals } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Vue d&apos;ensemble</h1>
        <p className="opacity-60 text-sm mt-1">
          Statistiques globales de toutes les associations
        </p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Associations" value={totals.associations} icon={Building2} />
        <StatCard title="Produits" value={totals.products} icon={Package} tone="info" />
        <StatCard title="Catégories" value={totals.categories} icon={Tags} tone="success" />
        <StatCard
          title="Valeur stock"
          value={formatMoney(totals.stockValue, "EUR")}
          icon={Wallet}
          tone="warning"
        />
        <StatCard title="Transactions" value={totals.transactions} icon={Receipt} />
        <StatCard title="Entrées" value={totals.inTx} icon={TrendingUp} tone="success" />
        <StatCard title="Sorties" value={totals.outTx} icon={TrendingDown} tone="error" />
        <StatCard title="Alertes stock" value={totals.lowStock + totals.outOfStock} icon={AlertTriangle} tone="warning" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-base-100 border border-base-200 rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold mb-4">Mouvements de stock (30 jours)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dailyMovements}>
                <defs>
                  <linearGradient id="inColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="outColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="in" name="Entrées" stroke="#22c55e" fill="url(#inColor)" />
                <Area type="monotone" dataKey="out" name="Sorties" stroke="#ef4444" fill="url(#outColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-base-100 border border-base-200 rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold mb-4">État du stock</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.stockStatus}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {data.stockStatus.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2">
            <div>
              <p className="font-bold text-success">{totals.inStock}</p>
              <p className="opacity-60">Normal</p>
            </div>
            <div>
              <p className="font-bold text-warning">{totals.lowStock}</p>
              <p className="opacity-60">Faible</p>
            </div>
            <div>
              <p className="font-bold text-error">{totals.outOfStock}</p>
              <p className="opacity-60">Rupture</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-base-100 border border-base-200 rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold mb-4">Produits par catégorie</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryDistribution}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="Produits" fill="#38bdf8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-base-100 border border-base-200 rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold mb-4">Top produits (valeur stock)</h2>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Asso</th>
                  <th>Qté</th>
                  <th>Valeur</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.name}</td>
                    <td className="opacity-70">{p.association}</td>
                    <td>
                      {p.quantity} {p.unit}
                    </td>
                    <td>{formatMoney(p.value, "EUR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-base-100 border border-base-200 rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Produits critiques
          </h2>
          {data.criticalProducts.length === 0 ? (
            <p className="opacity-60 text-sm">Aucun produit critique</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Stock</th>
                    <th>Seuil</th>
                    <th>Asso</th>
                  </tr>
                </thead>
                <tbody>
                  {data.criticalProducts.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td className={p.quantity === 0 ? "text-error font-bold" : "text-warning"}>
                        {p.quantity} {p.unit}
                      </td>
                      <td>{p.minQuantity}</td>
                      <td className="opacity-70">{p.association}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-base-100 border border-base-200 rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold mb-4">Transactions récentes</h2>
          <div className="space-y-3">
            {data.recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-3 border border-base-200 rounded-xl px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{tx.productName}</p>
                  <p className="text-xs opacity-60 truncate">
                    {tx.association}
                    {tx.beneficiary ? ` · ${tx.beneficiary}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-bold ${tx.type === "IN" ? "text-success" : "text-error"}`}>
                    {tx.type === "IN" ? "+" : "-"}
                    {tx.quantity} {tx.unit}
                  </p>
                  <p className="text-xs opacity-60">
                    {new Date(tx.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
