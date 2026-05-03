"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      aria-label="Cambiar tema"
      className="rounded-full border-border bg-card text-foreground shadow-none hover:bg-muted dark:hover:bg-secondary"
      size="icon-sm"
      type="button"
      variant="outline"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
      <span className="sr-only">Cambiar tema</span>
    </Button>
  );
}
