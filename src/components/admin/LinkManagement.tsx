"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Plus, ExternalLink, RefreshCw } from "lucide-react";
import { getLinkIcon, isInternalUrl } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchIconOnClient, saveLocalIconToServer } from "@/lib/client-utils";
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
  const [loadedIcons, setLoadedIcons] = useState<Record<string, boolean>>({});
  const [iconUrls, setIconUrls] = useState<Record<string, string>>({});
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [refreshingIcon, setRefreshingIcon] = useState<string | null>(null);

  // Load icon URLs when component mounts
  useEffect(() => {
    const loadIcons = async () => {
      const urls: Record<string, string> = {};

      for (const link of links) {
        if (isInternalUrl(link.url)) {
          urls[link.id] = "/icons/network-icon.svg";
        } else {
          try {
            urls[link.id] = await getLinkIcon(link);
          } catch (error) {
            urls[link.id] = "/placeholder-icon.svg";
          }
        }
      }

      setIconUrls(urls);
    };

    loadIcons();
  }, [links]);

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

  const handleIconError = (linkId: string) => {
    setLoadedIcons((prev) => ({
      ...prev,
      [linkId]: false,
    }));
  };

  const confirmDelete = async () => {
    if (!selectedLinkId) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/links/${selectedLinkId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setIsDeleteDialogOpen(false);
        router.refresh();
      } else {
        const data = await response.json();
        alert(`删除失败: ${data.error || "未知错误"}`);
      }
    } catch (error) {
      console.error("删除链接时出错:", error);
      alert("删除失败，请重试");
    } finally {
      setIsDeleting(false);
    }
  };

  // 刷新内网链接的图标
  const refreshInternalIcon = async (linkId: string, url: string) => {
    if (!isInternalUrl(url)) return;

    setRefreshingIcon(linkId);

    try {
      // 客户端尝试获取内网图标
      const iconBase64 = await fetchIconOnClient(url);

      if (iconBase64) {
        // 保存获取到的图标
        const success = await saveLocalIconToServer(linkId, iconBase64);

        if (success) {
          alert("图标更新成功！");
          router.refresh();
        } else {
          alert("保存图标失败，请重试");
        }
      } else {
        alert("未能获取到图标");
      }
    } catch (error) {
      console.error("刷新图标时出错:", error);
      alert("刷新图标失败，请重试");
    } finally {
      setRefreshingIcon(null);
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">图标</TableHead>
                <TableHead>标题</TableHead>
                <TableHead className="hidden md:table-cell">URL</TableHead>
                <TableHead className="hidden lg:table-cell">外部URL</TableHead>
                <TableHead className="hidden sm:table-cell">类别</TableHead>
                <TableHead className="w-[150px] text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>
                    <div className="w-10 h-10 relative rounded-md overflow-hidden border flex items-center justify-center bg-background">
                      {loadedIcons[link.id] === false ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-muted-foreground"
                        >
                          <rect
                            width="18"
                            height="18"
                            x="3"
                            y="3"
                            rx="2"
                            ry="2"
                          />
                          <path d="M9 17v-2" />
                          <path d="M12 17v-6" />
                          <path d="M15 17v-4" />
                        </svg>
                      ) : (
                        <img
                          src={iconUrls[link.id] || "/placeholder-icon.svg"}
                          alt={link.title}
                          className="h-full w-full object-contain"
                          onError={() => handleIconError(link.id)}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{link.title}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-xs truncate block max-w-[200px]">
                      {link.url}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-xs truncate block max-w-[200px]">
                      {link.externalUrl || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {link.category?.name || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {isInternalUrl(link.url) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => refreshInternalIcon(link.id, link.url)}
                          disabled={refreshingIcon === link.id}
                        >
                          <RefreshCw
                            className={`h-4 w-4 ${
                              refreshingIcon === link.id ? "animate-spin" : ""
                            }`}
                          />
                          <span className="sr-only">刷新图标</span>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/links/${link.id}`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">编辑</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedLinkId(link.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">删除</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除"
              {links.find((link) => link.id === selectedLinkId)?.title}
              "吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
