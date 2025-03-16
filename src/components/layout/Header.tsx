"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import {
  SunIcon,
  MoonIcon,
  Laptop2Icon,
  HomeIcon,
  Settings2Icon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";

export function Header() {
  const { setTheme, theme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold transition-colors hover:text-primary"
          >
            <HomeIcon className="h-5 w-5" />
            <span className="hidden sm:inline-flex">我的导航</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="flex items-center gap-1 px-2 py-1 rounded-md font-medium text-sm transition-colors hover:text-primary hover:bg-accent"
          >
            <Settings2Icon className="h-4 w-4" />
            <span className="hidden sm:inline-flex">管理</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 组件挂载后再渲染主题切换UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // 如果未挂载，返回空占位符，保持布局稳定
  if (!mounted) {
    return (
      <div className="flex items-center space-x-1 rounded-md border">
        <div className="h-8 w-8"></div>
        <div className="h-8 w-8"></div>
        <div className="h-8 w-8"></div>
      </div>
    );
  }

  // 确定哪个按钮应该高亮
  const activeTheme = theme === "system" ? resolvedTheme : theme;

  return (
    <div className="flex items-center space-x-1 rounded-md border">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 px-0",
          activeTheme === "light" && "bg-accent text-accent-foreground"
        )}
        onClick={() => setTheme("light")}
        aria-label="切换至亮色主题"
      >
        <SunIcon className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 px-0",
          activeTheme === "dark" && "bg-accent text-accent-foreground"
        )}
        onClick={() => setTheme("dark")}
        aria-label="切换至暗色主题"
      >
        <MoonIcon className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 px-0",
          theme === "system" && "bg-accent text-accent-foreground"
        )}
        onClick={() => setTheme("system")}
        aria-label="切换至系统主题"
      >
        <Laptop2Icon className="h-4 w-4" />
      </Button>
    </div>
  );
}
