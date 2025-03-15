"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Plus, ExternalLink } from "lucide-react";
import { getLinkIcon } from "@/lib/utils";
import type {
  LinkWithRelations,
  CategoryWithLinks,
  TagWithLinks,
} from "@/lib/types";

interface LinkManagementProps {
  links: LinkWithRelations[];
  categories: CategoryWithLinks[];
  tags: TagWithLinks[];
}

export function LinkManagement({
  links,
  categories,
  tags,
}: LinkManagementProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedLink, setSelectedLink] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (isDeleting) return;

    setIsDeleting(true);
    setSelectedLink(id);

    try {
      const response = await fetch(`/api/links/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("删除失败，请重试");
      }
    } catch (error) {
      console.error("删除链接时出错:", error);
      alert("删除失败，请重试");
    } finally {
      setIsDeleting(false);
      setSelectedLink(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">链接管理</h2>
        <Link
          href="/admin/links/new"
          className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          添加链接
        </Link>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">
                  标题
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">URL</th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  分类
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  标签
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  可见性
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-b">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 overflow-hidden rounded-md border">
                        <img
                          src={getLinkIcon(link)}
                          alt={link.title}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <span className="font-medium">{link.title}</span>
                    </div>
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-sm text-muted-foreground">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center hover:underline"
                    >
                      {link.url}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {link.category?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {link.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex h-5 items-center rounded-full px-2 text-xs font-medium"
                          style={{
                            backgroundColor: tag.color
                              ? `${tag.color}20`
                              : "#e5e7eb",
                            color: tag.color || "#4b5563",
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {link.isPublic ? (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        公开
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        私有
                      </span>
                    )}
                    {link.isInternalOnly && (
                      <span className="ml-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        内网
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/links/${link.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">编辑</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(link.id)}
                        disabled={isDeleting && selectedLink === link.id}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">删除</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {links.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    暂无链接，点击"添加链接"按钮创建
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
