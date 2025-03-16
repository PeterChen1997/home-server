import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { LinkCard } from "@/components/LinkCard";
import type { LinkWithRelations } from "@/lib/types";
import { isInternalUrl } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

async function getLinks(): Promise<LinkWithRelations[]> {
  const links = await prisma.link.findMany({
    where: {
      isPublic: true,
    },
    include: {
      category: true,
      tags: true,
    },
    orderBy: [{ category: { name: "asc" } }, { title: "asc" }],
  });

  return links as LinkWithRelations[];
}

// 创建默认的图标，基于链接的第一个字符
function getDefaultIcon(link: LinkWithRelations): string {
  // 如果链接有自定义图标，优先使用
  if (link.icon) {
    return link.icon;
  }

  // 检查是否是内部链接
  if (isInternalUrl(link.url)) {
    return "/icons/network-icon.svg";
  }

  // 使用站点的第一个字符作为图标文本
  const hostname = link.url ? new URL(link.url).hostname : "";
  const firstChar = (hostname[0] || link.title[0] || "A").toUpperCase();

  // 返回默认图标的路径
  return `/api/default-icon?char=${firstChar}&name=${encodeURIComponent(
    link.title
  )}`;
}

export default async function Home() {
  const links = await getLinks();

  // 处理链接图标，优先使用数据库中存储的图标
  const linksWithIcons = links.map((link) => {
    // 使用数据库中存储的图标，或默认图标
    const iconBase64 = getDefaultIcon(link);
    return { ...link, iconBase64 };
  });

  // 按分类分组链接
  const linksByCategory: Record<
    string,
    (LinkWithRelations & { iconBase64: string })[]
  > = {};
  const uncategorizedLinks: (LinkWithRelations & { iconBase64: string })[] = [];

  linksWithIcons.forEach((link) => {
    if (link.category) {
      const categoryName = link.category.name;
      if (!linksByCategory[categoryName]) {
        linksByCategory[categoryName] = [];
      }
      linksByCategory[categoryName].push(link);
    } else {
      uncategorizedLinks.push(link);
    }
  });

  return (
    <div className="space-y-10 pb-8">
      {/* 酷炫Hero Section */}
      <section className="w-full py-12 md:py-20 lg:py-32 border-b relative overflow-hidden bg-gradient-to-br from-background to-background/80 dark:from-background dark:to-background/90">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]"></div>
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl"></div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="inline-block rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground mb-2">
              个人导航 · 随时访问
            </div>
            <div className="space-y-3 max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                探索我的数字世界
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl">
                这里收集了我日常使用的所有重要网站和工具，让导航变得简单而高效。
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              <Button className="gap-1 group" size="lg">
                开始探索{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg">
                了解更多
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 链接内容区 */}
      <Suspense
        fallback={
          <div className="grid place-items-center h-40">
            <div className="animate-pulse text-muted-foreground">加载中...</div>
          </div>
        }
      >
        <div className="container px-4 md:px-6 space-y-10">
          {/* 按分类显示链接 */}
          {Object.entries(linksByCategory).map(
            ([categoryName, categoryLinks]) => (
              <section key={categoryName} className="space-y-4">
                <div className="flex items-center">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {categoryName}
                  </h2>
                  <div className="ml-4 h-px flex-1 bg-border"></div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {categoryLinks.map((link) => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      showCategory={false}
                      iconBase64={link.iconBase64}
                    />
                  ))}
                </div>
              </section>
            )
          )}

          {/* 未分类链接 */}
          {uncategorizedLinks.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center">
                <h2 className="text-2xl font-semibold tracking-tight">其他</h2>
                <div className="ml-4 h-px flex-1 bg-border"></div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {uncategorizedLinks.map((link) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    iconBase64={link.iconBase64}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </Suspense>
    </div>
  );
}
