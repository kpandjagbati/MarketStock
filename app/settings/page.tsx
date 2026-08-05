"use client"

import { useUser } from "@clerk/nextjs"
import { Settings } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { getAssociation, updateAssociationSettings } from "../actions"
import Wrapper from "../components/Wrapper"

const CURRENCIES = [
  { code: "EUR", label: "Euro (€)" },
  { code: "XOF", label: "Franc CFA (CFA)" },
  { code: "USD", label: "Dollar US ($)" },
  { code: "GBP", label: "Livre sterling (£)" },
  { code: "CAD", label: "Dollar canadien (CA$)" },
  { code: "CHF", label: "Franc suisse (CHF)" },
]

const page = () => {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [currency, setCurrency] = useState("EUR")
  const [defaultMinQuantity, setDefaultMinQuantity] = useState(5)

  useEffect(() => {
    const load = async () => {
      if (!email) return
      try {
        const assoc = await getAssociation(email)
        if (assoc) {
          setName(assoc.name)
          setCurrency(assoc.currency || "EUR")
          setDefaultMinQuantity(assoc.defaultMinQuantity ?? 5)
        }
      } catch (error) {
        console.error(error)
        toast.error("Impossible de charger les paramètres")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [email])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSaving(true)
    try {
      await updateAssociationSettings(email, {
        name,
        currency,
        defaultMinQuantity,
      })
      toast.success("Paramètres enregistrés")
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Wrapper>
      <div className="max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/20 p-3 rounded-full">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Paramètres</h1>
            <p className="text-sm opacity-70">
              Configurez votre association et les valeurs par défaut
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 border-2 border-base-200 rounded-3xl p-6">
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Nom de l&apos;association
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Devise</label>
              <select
                className="select select-bordered w-full"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">
                Seuil d&apos;alerte par défaut
              </label>
              <input
                type="number"
                min={0}
                className="input input-bordered w-full"
                value={defaultMinQuantity}
                onChange={(e) => setDefaultMinQuantity(Number(e.target.value))}
              />
              <p className="text-xs opacity-60 mt-1">
                Utilisé comme seuil initial à la création d&apos;un nouveau produit
              </p>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Enregistrer"
              )}
            </button>
          </form>
        )}
      </div>
    </Wrapper>
  )
}

export default page
