import { useState, useEffect } from 'react'

// Custom hook that manages the dark/light mode toggle.
// It reads the saved preference from localStorage on first load,
// and writes back to localStorage whenever the user toggles.
// It also adds/removes the "dark" class on <html> which is what
// Tailwind's darkMode: 'class' strategy watches for.
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // On first render, check if the user previously chose dark mode.
    // If nothing is saved, default to light mode.
    return localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    const root = document.documentElement // this is the <html> element
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const toggle = () => setIsDark(prev => !prev)

  return { isDark, toggle }
}