import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { LinkCard } from "@/components/LinkCard";
import type { LinkWithRelations } from "@/lib/types";
import { getLinkIcon } from "@/lib/utils";

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

  // 获取所有链接的图标Base64
  const linksWithIcons = await Promise.all(
    links.map(async (link) => {
      const iconBase64 = await getLinkIcon(link);
      return { ...link, iconBase64 };
    })
  );

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
    <>
      <div className="space-y-6 pb-8 pt-2 md:pb-12 md:pt-4">
        <div className="flex max-w-[980px] flex-col items-start gap-2">
          <h1 className="text-3xl font-bold leading-tight tracking-tighter text-foreground md:text-4xl">
            我的导航
          </h1>
          <p className="max-w-[700px] text-muted-foreground">
            个人网站链接导航，快速访问常用站点
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-8">加载中...</div>
        }
      >
        <div className="grid gap-8">
          {/* 按分类显示链接 */}
          {Object.entries(linksByCategory).map(
            ([categoryName, categoryLinks]) => (
              <div key={categoryName} className="space-y-4">
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    {categoryName}
                  </h2>
                  <div className="ml-2 h-[1px] flex-1 bg-border"></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {categoryLinks.map((link) => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      showCategory={false}
                      iconBase64={link.iconBase64}
                    />
                  ))}
                </div>
              </div>
            )
          )}

          {/* 未分类链接 */}
          {uncategorizedLinks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  其他
                </h2>
                <div className="ml-2 h-[1px] flex-1 bg-border"></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {uncategorizedLinks.map((link) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    iconBase64={link.iconBase64}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Suspense>
    </>
  );
}
