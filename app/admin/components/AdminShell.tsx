"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  LayoutDashboard,
  Menu,
  Package,
  Receipt,
  Shield,
  X,
  ArrowLeft,
} from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { useState } from "react"
import ThemeToggle from "../../components/ThemeToggle"

const links = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/admin/associations", label: "Associations", icon: Building2 },
  { href: "/admin/products", label: "Produits", icon: Package },
  { href: "/admin/transactions", label: "Transactions", icon: Receipt },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const Nav = () => (
    <>
      <div className="flex items-center gap-2 px-4 py-5 border-b border-base-300">
        <div className="bg-primary/20 p-2 rounded-xl">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-bold leading-tight">Admin</p>
          <p className="text-xs opacity-60">MarketStock</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`btn btn-sm justify-start w-full gap-2 ${
                active ? "btn-primary" : "btn-ghost"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-base-300 space-y-2">
        <Link href="/" className="btn btn-ghost btn-sm w-full justify-start gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour app
        </Link>
        <div className="flex items-center justify-between px-1">
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-base-200/40 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-base-300 bg-base-100 sticky top-0 h-screen">
        <Nav />
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />
        <aside
          className={`absolute top-0 left-0 h-full w-72 bg-base-100 flex flex-col transition-transform ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            className="btn btn-sm btn-ghost absolute right-2 top-2"
            onClick={() => setOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
          <Nav />
        </aside>
      </div>

      <div className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 z-40 bg-base-100 border-b border-base-300 px-4 py-3 flex items-center justify-between">
          <button className="btn btn-sm btn-ghost" onClick={() => setOpen(true)}>
            <Menu className="w-4 h-4" />
          </button>
          <span className="font-bold">Espace Admin</span>
          <UserButton />
        </header>
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
