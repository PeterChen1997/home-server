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
    orderBy: [{ category: { name: "asc" } }, { title: "asc" }],
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
    <div className="space-y-10 pb-8">
      {/* 头部标题区 */}
      <section className="w-full py-6 md:py-10 lg:py-12 border-b">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                我的导航
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                个人网站链接导航，快速访问常用站点
              </p>
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
