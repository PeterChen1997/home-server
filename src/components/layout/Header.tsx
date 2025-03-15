"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Menu, Search, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-primary">
              我的导航
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/" ? "text-foreground" : "text-muted-foreground"
              )}
            >
              首页
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname.startsWith("/admin")
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                管理
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            href="/search"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">搜索</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground md:hidden"
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">管理</span>
            </Link>
          )}

          {session ? (
            <button
              onClick={() => signOut()}
              className="flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              退出
            </button>
          ) : (
            <Link
              href="/login"
              className="flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
