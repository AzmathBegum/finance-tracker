import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    // 1️⃣ Check if user chose manually before
    const stored = localStorage.getItem("theme");
    if (stored) return stored;

    // 2️⃣ Else follow system theme
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.9 }}
      className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-300 text-sm shadow"
    >
      <span>{theme === "dark" ? "☀️ Light" : "🌙 Dark"}</span>
      <span className="text-xs opacity-70">(auto-ready)</span>
    </motion.button>
  );
}
