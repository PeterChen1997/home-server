import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LinkForm } from "@/components/admin/LinkForm";
import type { CategoryWithLinks, TagWithLinks } from "@/lib/types";

async function getData() {
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
    categories: categories as CategoryWithLinks[],
    tags: tags as TagWithLinks[],
  };
}

export default async function NewLinkPage() {
  const session = await getServerSession(authOptions);

  // 检查用户是否已登录且是管理员
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  const { categories, tags } = await getData();

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">添加新链接</h1>
        <p className="mt-2 text-muted-foreground">创建一个新的链接</p>
      </div>

      <div className="space-y-8">
        <LinkForm categories={categories} tags={tags} />
      </div>
    </div>
  );
}
