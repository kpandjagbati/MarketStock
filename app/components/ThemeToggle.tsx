"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

const LIGHT_THEME = "cmyk"
const DARK_THEME = "night"

const ThemeToggle = () => {
  const [theme, setTheme] = useState<string>(LIGHT_THEME)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    const current =
      stored === LIGHT_THEME || stored === DARK_THEME
        ? stored
        : document.documentElement.getAttribute("data-theme") || LIGHT_THEME

    setTheme(current)
    document.documentElement.setAttribute("data-theme", current)
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const next = theme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME
    setTheme(next)
    document.documentElement.setAttribute("data-theme", next)
    localStorage.setItem("theme", next)
  }

  if (!mounted) {
    return <div className="btn btn-sm btn-ghost w-9 h-9" aria-hidden />
  }

  const isDark = theme === DARK_THEME

  return (
    <button
      type="button"
      className="btn btn-sm btn-ghost"
      onClick={toggleTheme}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      title={isDark ? "Mode clair (cmyk)" : "Mode sombre (night)"}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}

export default ThemeToggle
