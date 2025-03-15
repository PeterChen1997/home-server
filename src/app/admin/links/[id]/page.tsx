import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LinkForm } from "@/components/admin/LinkForm";
import type {
  LinkWithRelations,
  CategoryWithLinks,
  TagWithLinks,
} from "@/lib/types";

interface EditLinkPageProps {
  params: {
    id: string;
  };
}

async function getData(id: string) {
  const link = await prisma.link.findUnique({
    where: { id },
    include: {
      category: true,
      tags: true,
    },
  });

  if (!link) {
    return null;
  }

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
    link: link as LinkWithRelations,
    categories: categories as CategoryWithLinks[],
    tags: tags as TagWithLinks[],
  };
}

export default async function EditLinkPage({ params }: EditLinkPageProps) {
  const session = await getServerSession(authOptions);

  // 检查用户是否已登录且是管理员
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  const data = await getData(params.id);

  if (!data) {
    notFound();
  }

  const { link, categories, tags } = data;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">编辑链接</h1>
        <p className="mt-2 text-muted-foreground">编辑 "{link.title}" 的信息</p>
      </div>

      <div className="space-y-8">
        <LinkForm link={link} categories={categories} tags={tags} isEditing />
      </div>
    </div>
  );
}
