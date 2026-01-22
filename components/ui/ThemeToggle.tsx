"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "./button";

export const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themes: Array<{ value: Theme; icon: typeof Sun; label: string }> = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  const currentTheme = themes.find((t) => t.value === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  const cycleTheme = () => {
    const currentIndex = themes.findIndex((t) => t.value === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].value);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="relative w-10 h-10 p-0"
      title={`Theme: ${currentTheme.label} (click to cycle)`}
    >
      <CurrentIcon className="h-4 w-4" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

type Theme = "light" | "dark" | "system";
