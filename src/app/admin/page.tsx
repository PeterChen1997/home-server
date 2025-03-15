import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LinkManagement } from "@/components/admin/LinkManagement";
import type {
  LinkWithRelations,
  CategoryWithLinks,
  TagWithLinks,
} from "@/lib/types";

async function getData() {
  const links = await prisma.link.findMany({
    include: {
      category: true,
      tags: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  const categories = await prisma.category.findMany({
    include: {
      links: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const tags = await prisma.tag.findMany({
    include: {
      links: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return {
    links: links as LinkWithRelations[],
    categories: categories as CategoryWithLinks[],
    tags: tags as TagWithLinks[],
  };
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // 检查用户是否已登录且是管理员
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  const { links, categories, tags } = await getData();

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">管理面板</h1>
        <p className="mt-2 text-muted-foreground">管理您的链接、分类和标签</p>
      </div>

      <div className="space-y-8">
        <LinkManagement links={links} categories={categories} tags={tags} />
      </div>
    </div>
  );
}
