"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-context";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const reduceMotion = useReducedMotion();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="rounded-full text-ink-muted"
      aria-label="Toggle theme"
      title="Toggle theme"
      onClick={toggleTheme}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={
            reduceMotion ? { opacity: 0 } : { rotate: -90, opacity: 0, scale: 0.6 }
          }
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={
            reduceMotion ? { opacity: 0 } : { rotate: 90, opacity: 0, scale: 0.6 }
          }
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}