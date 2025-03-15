import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { LinkCard } from "@/components/LinkCard";
import type { LinkWithRelations } from "@/lib/types";

async function getLinks(): Promise<LinkWithRelations[]> {
  const links = await prisma.link.findMany({
    where: {
      isPublic: true,
    },
    include: {
      category: true,
      tags: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  return links as LinkWithRelations[];
}

export default async function Home() {
  const links = await getLinks();

  // 按分类分组链接
  const linksByCategory: Record<string, LinkWithRelations[]> = {};
  const uncategorizedLinks: LinkWithRelations[] = [];

  links.forEach((link) => {
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
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">我的导航</h1>
        <p className="mt-2 text-muted-foreground">
          个人网站链接导航，快速访问常用站点
        </p>
      </div>

      <Suspense fallback={<div>加载中...</div>}>
        {/* 按分类显示链接 */}
        {Object.entries(linksByCategory).map(
          ([categoryName, categoryLinks]) => (
            <div key={categoryName} className="mb-8">
              <h2 className="mb-4 text-xl font-semibold">{categoryName}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryLinks.map((link) => (
                  <LinkCard key={link.id} link={link} showCategory={false} />
                ))}
              </div>
            </div>
          )
        )}

        {/* 未分类链接 */}
        {uncategorizedLinks.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">其他</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {uncategorizedLinks.map((link) => (
                <LinkCard key={link.id} link={link} />
              ))}
            </div>
          </div>
        )}
      </Suspense>
    </div>
  );
}
