import React, { createContext, useContext, useEffect, useState } from "react"

export type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = "gemforge_theme"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
      if (saved === "light" || saved === "dark") {
        return saved
      }
      // Check system preference
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        return "light"
      }
    }
    return "dark" // Default dark-first developer theme
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
      root.classList.remove("light")
      root.style.colorScheme = "dark"
    } else {
      root.classList.add("light")
      root.classList.remove("dark")
      root.style.colorScheme = "light"
    }
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"))
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
