"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { isInternalUrl } from "@/lib/utils";
import {
  fetchIconOnClient,
  saveIconToServer,
  saveLocalIconToServer,
} from "@/lib/client-utils";
import type {
  LinkWithRelations,
  CategoryWithLinks,
  TagWithLinks,
} from "@/lib/types";

interface LinkFormProps {
  link?: LinkWithRelations;
  categories: CategoryWithLinks[];
  tags: TagWithLinks[];
  isEditing?: boolean;
}

export function LinkForm({
  link,
  categories,
  tags,
  isEditing = false,
}: LinkFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userManuallySetInternalFlag = useRef(false);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    externalUrl: "",
    description: "",
    icon: "",
    isInternalOnly: false,
    isPublic: true,
    categoryId: "",
    tagIds: [] as string[],
  });

  // 如果是编辑模式，初始化表单数据
  useEffect(() => {
    if (isEditing && link) {
      setFormData({
        title: link.title,
        url: link.url,
        externalUrl: link.externalUrl || "",
        description: link.description || "",
        icon: link.icon || "",
        isInternalOnly: link.isInternalOnly,
        isPublic: link.isPublic,
        categoryId: link.categoryId || "",
        tagIds: link.tags.map((tag) => tag.id),
      });
    }
  }, [isEditing, link]);

  // 仅当创建新链接时，监听URL变化自动设置内网标志
  useEffect(() => {
    if (!isEditing && formData.url && isInternalUrl(formData.url)) {
      setFormData((prev) => ({ ...prev, isInternalOnly: true }));
    }
  }, [formData.url, isEditing]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));

      // 如果用户手动更改了isInternalOnly，记录下来
      if (name === "isInternalOnly") {
        userManuallySetInternalFlag.current = true;
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // 仅当URL改变且用户没有手动操作过isInternalOnly复选框时，才自动设置
    if (name === "url" && value && !userManuallySetInternalFlag.current) {
      const isInternal = isInternalUrl(value);
      setFormData((prev) => ({ ...prev, isInternalOnly: isInternal }));
    }
  };

  const handleTagChange = (tagId: string) => {
    setFormData((prev) => {
      const tagIds = [...prev.tagIds];
      const index = tagIds.indexOf(tagId);

      if (index === -1) {
        tagIds.push(tagId);
      } else {
        tagIds.splice(index, 1);
      }

      return { ...prev, tagIds };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // 验证至少提供了一个URL
    if (!formData.url && !formData.externalUrl) {
      alert("请至少提供一个URL（内网或外网）");
      return;
    }

    setIsSubmitting(true);

    try {
      // 如果没有设置自定义图标，尝试在客户端获取图标
      let iconBase64: string | null = formData.icon;

      // 创建/更新链接
      const endpoint = isEditing ? `/api/links/${link?.id}` : "/api/links";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          description: formData.description || null,
          icon: iconBase64 || null,
          categoryId: formData.categoryId || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const linkId = data.data?.id;

        // 如果没有自定义图标，但创建/更新成功了链接
        if (!iconBase64 && linkId) {
          // 确定要使用的URL
          const url = formData.url || formData.externalUrl;

          if (url) {
            try {
              // 客户端尝试获取图标
              iconBase64 = await fetchIconOnClient(url);

              if (iconBase64) {
                console.log("客户端成功获取图标");

                // 检查是否是内网URL
                if (isInternalUrl(url)) {
                  // 对于内网URL，使用专门的API保存
                  await saveLocalIconToServer(linkId, iconBase64);
                } else {
                  // 对于外网URL，使用通用API保存
                  await saveIconToServer(linkId, iconBase64, url);
                }
              }
            } catch (iconError) {
              console.log("客户端获取图标失败，尝试其他方法", iconError);

              // 对于外网URL，可以尝试服务端获取
              if (!isInternalUrl(url)) {
                await saveIconToServer(linkId, null, url);
              }
            }
          }
        }

        router.push("/admin");
        router.refresh();
      } else {
        const data = await response.json();
        alert(`保存失败: ${data.error || "未知错误"}`);
      }
    } catch (error) {
      console.error("保存链接时出错:", error);
      alert("保存失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            标题 <span className="text-destructive">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="url"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            内网 URL
          </label>
          <input
            id="url"
            name="url"
            type="url"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.url}
            onChange={handleChange}
            placeholder="例如: http://192.168.1.100:8080 或 http://nas.local"
          />
          <p className="text-xs text-muted-foreground">内网或首选访问链接</p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="externalUrl"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            外网 URL
          </label>
          <input
            id="externalUrl"
            name="externalUrl"
            type="url"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.externalUrl}
            onChange={handleChange}
            placeholder="例如: https://example.com"
          />
          <p className="text-xs text-muted-foreground">
            当不在本地网络时访问的链接（至少需要提供内网URL或外网URL之一）
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="description"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            描述
          </label>
          <textarea
            id="description"
            name="description"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="icon"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            图标URL
          </label>
          <input
            id="icon"
            name="icon"
            type="url"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.icon}
            onChange={handleChange}
            placeholder="留空将自动获取网站图标"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="categoryId"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            分类
          </label>
          <select
            id="categoryId"
            name="categoryId"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.categoryId}
            onChange={handleChange}
          >
            <option value="">-- 选择分类 --</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            标签
          </label>
          <div className="flex flex-wrap gap-2 rounded-md border border-input bg-background p-3 max-h-40 overflow-y-auto">
            {tags.length === 0 ? (
              <span className="text-sm text-muted-foreground">暂无标签</span>
            ) : (
              <>
                <div className="w-full mb-2">
                  <p className="text-xs text-muted-foreground mb-1">
                    常用标签:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tags
                      .filter((tag) =>
                        ["工作", "学习", "娱乐", "内网", "公网"].includes(
                          tag.name
                        )
                      )
                      .map((tag) => (
                        <label
                          key={tag.id}
                          className="flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: formData.tagIds.includes(tag.id)
                              ? tag.color
                                ? `${tag.color}30`
                                : "#e5e7eb"
                              : "transparent",
                            color: tag.color || "#4b5563",
                            border: `1px solid ${tag.color || "#d1d5db"}`,
                          }}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={formData.tagIds.includes(tag.id)}
                            onChange={() => handleTagChange(tag.id)}
                          />
                          {tag.name}
                        </label>
                      ))}
                  </div>
                </div>

                <div className="w-full">
                  <p className="text-xs text-muted-foreground mb-1">
                    所有标签:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tags
                      .filter(
                        (tag) =>
                          !["工作", "学习", "娱乐", "内网", "公网"].includes(
                            tag.name
                          )
                      )
                      .sort((a, b) => a.name.localeCompare(b.name, "zh-CN"))
                      .map((tag) => (
                        <label
                          key={tag.id}
                          className="flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: formData.tagIds.includes(tag.id)
                              ? tag.color
                                ? `${tag.color}30`
                                : "#e5e7eb"
                              : "transparent",
                            color: tag.color || "#4b5563",
                            border: `1px solid ${tag.color || "#d1d5db"}`,
                          }}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={formData.tagIds.includes(tag.id)}
                            onChange={() => handleTagChange(tag.id)}
                          />
                          {tag.name}
                        </label>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isInternalOnly"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={formData.isInternalOnly}
            onChange={handleChange}
          />
          <span className="text-sm font-medium">仅内网可访问</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isPublic"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={formData.isPublic}
            onChange={handleChange}
          />
          <span className="text-sm font-medium">公开显示</span>
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "保存中..." : isEditing ? "更新链接" : "添加链接"}
        </button>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          onClick={() => router.back()}
        >
          取消
        </button>
      </div>
    </form>
  );
}
