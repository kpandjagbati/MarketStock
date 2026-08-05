"use client"

import { Product } from "@/type"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getStockSummary } from "../actions"
import ProductImage from "./ProductImage"

const StockAlerts = ({ email }: { email: string }) => {
  const [alerts, setAlerts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!email) return
      try {
        const summary = await getStockSummary(email)
        setAlerts(summary.criticalProducts.slice(0, 5))
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchAlerts()
  }, [email])

  if (loading) return null
  if (alerts.length === 0) return null

  return (
    <div className="mb-4 rounded-3xl border-2 border-base-200 bg-base-200/50 p-4 flex gap-3">
      <AlertTriangle className="w-5 h-5 shrink-0 text-error mt-0.5" />
      <div className="w-full">
        <h3 className="font-bold">Alertes stock</h3>
        <p className="text-sm opacity-80 mb-3">
          {alerts.length} produit{alerts.length > 1 ? "s" : ""} en stock faible ou en rupture
        </p>
        <div className="flex flex-col gap-2">
          {alerts.map((product) => {
            const isOut = product.quantity === 0
            return (
              <div
                key={product.id}
                className="flex items-center justify-between gap-3 bg-base-100 rounded-xl px-3 py-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ProductImage
                    src={product.imageUrl}
                    alt={product.name}
                    heightClass="h-10"
                    widthClass="w-10"
                  />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-xs opacity-70">
                      Seuil : {product.minQuantity} {product.unit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`badge badge-sm ${isOut ? "badge-error" : "badge-warning"}`}>
                    {isOut ? "Rupture" : `${product.quantity} ${product.unit}`}
                  </span>
                  <Link
                    href={`/update-product/${product.id}`}
                    className="btn btn-xs btn-ghost"
                  >
                    Voir
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default StockAlerts
