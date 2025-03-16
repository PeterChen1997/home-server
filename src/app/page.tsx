import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { LinkCard } from "@/components/LinkCard";
import type { LinkWithRelations } from "@/lib/types";
import { isInternalUrl } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollButton from "../components/ScrollButton";
import { CoolCard } from "@/components/CoolCard";
import { Metadata } from "next";

// 设置页面缓存配置，revalidate=0 表示不缓存
export const revalidate = 0;

// 使用generateMetadata可以确保每次访问时都生成新的元数据
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "我的导航 | 首页 - " + new Date().toISOString(),
    description: "个人导航页面，收集了日常使用的所有重要网站和工具",
  };
}

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
      {/* 更酷炫的Hero Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 border-b relative overflow-hidden">
        {/* 动态背景效果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.04] dark:opacity-[0.07]"></div>

        {/* 光晕效果 */}
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl animate-pulse"></div>
        <div
          className="absolute top-1/2 left-1/3 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-3xl animate-pulse"
          style={{ animationDelay: "1s", animationDuration: "7s" }}
        ></div>
        <div
          className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-primary/10 blur-3xl animate-pulse"
          style={{ animationDelay: "2s", animationDuration: "8s" }}
        ></div>

        {/* 漂浮元素 */}
        <div
          className="absolute top-20 right-[10%] w-12 h-12 rounded-full border border-primary/20 animate-float"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="absolute bottom-32 left-[15%] w-8 h-8 rounded-lg border border-primary/20 animate-float"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div
          className="absolute top-1/2 right-[30%] w-16 h-16 rounded-md border border-primary/20 animate-float rotate-45"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div
              className="inline-block rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground mb-2 animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              个人导航 · 随时访问
            </div>
            <div
              className="space-y-4 max-w-3xl mx-auto animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl xl:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70">
                探索我的数字世界
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl">
                这里收集了我日常使用的所有重要网站和工具，让导航变得简单而高效。
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ScrollButton
                targetId="links-section"
                className="bg-white/10 text-white hover:bg-white/20"
              >
                查看导航
              </ScrollButton>
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
        <div
          id="links-section"
          className="container px-4 md:px-6 space-y-10 scroll-mt-20"
        >
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
                    <CoolCard
                      key={link.id}
                      title={link.title}
                      description={link.description || undefined}
                      icon={link.iconBase64 || undefined}
                      link={link.url || link.externalUrl || "#"}
                      isExternal={!link.isInternalOnly}
                      tags={link.tags.map((tag) => tag.name)}
                      color={
                        link.tags[0]?.color || link.category?.color || "#7c3aed"
                      }
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
                  <CoolCard
                    key={link.id}
                    title={link.title}
                    description={link.description || undefined}
                    icon={link.iconBase64 || undefined}
                    link={link.url || link.externalUrl || "#"}
                    isExternal={!link.isInternalOnly}
                    tags={link.tags.map((tag) => tag.name)}
                    color={
                      link.tags[0]?.color || link.category?.color || "#7c3aed"
                    }
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
