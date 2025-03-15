"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

export function ThemeToggle({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // After mounting, we have access to the theme
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("h-6 w-6", className)} />;
  }

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="rounded-md p-2 hover:bg-secondary transition-colors focus:outline-none"
        aria-label="切换主题"
      >
        {theme === "dark" ? (
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        ) : (
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        )}
      </button>
    </div>
  );
}
