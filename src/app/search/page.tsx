"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { LinkCard } from "@/components/LinkCard";
import type { LinkWithRelations } from "@/lib/types";

// 创建一个包含useSearchParams的组件
function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [links, setLinks] = useState<LinkWithRelations[]>([]);

  // 执行搜索
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setLinks([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setLinks(data.data || []);
      } else {
        console.error("搜索失败");
        setLinks([]);
      }
    } catch (error) {
      console.error("搜索出错:", error);
      setLinks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 当URL参数中的搜索词变化时执行搜索
  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchTerm(query);
    performSearch(query);
  }, [searchParams]);

  // 处理搜索表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-center text-3xl font-bold tracking-tight">
        搜索链接
      </h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="搜索链接标题、URL或描述..."
            className="h-12 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 h-10 -translate-y-1/2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            搜索
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center text-muted-foreground">搜索中...</div>
        ) : searchParams.has("q") ? (
          links.length > 0 ? (
            <>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  找到 {links.length} 个结果
                </p>
              </div>
              <div className="grid gap-4">
                {links.map((link) => (
                  <LinkCard key={link.id} link={link} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground">
              未找到匹配的链接
            </div>
          )
        ) : (
          <div className="text-center text-muted-foreground">
            输入关键词开始搜索
          </div>
        )}
      </div>
    </div>
  );
}

// 主页面组件，使用Suspense包裹SearchContent
export default function SearchPage() {
  return (
    <div className="container py-8">
      <Suspense fallback={<div className="text-center">加载中...</div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
