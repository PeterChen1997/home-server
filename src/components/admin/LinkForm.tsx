"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isInternalUrl } from "@/lib/utils";
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
  const [formData, setFormData] = useState({
    title: "",
    url: "",
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
        description: link.description || "",
        icon: link.icon || "",
        isInternalOnly: link.isInternalOnly,
        isPublic: link.isPublic,
        categoryId: link.categoryId || "",
        tagIds: link.tags.map((tag) => tag.id),
      });
    } else if (!isEditing) {
      // 新建链接时，如果URL是内网地址，自动设置isInternalOnly为true
      if (formData.url && isInternalUrl(formData.url)) {
        setFormData((prev) => ({ ...prev, isInternalOnly: true }));
      }
    }
  }, [isEditing, link, formData.url]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // 如果修改了URL，检查是否是内网地址
    if (name === "url" && value) {
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

    setIsSubmitting(true);

    try {
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
          icon: formData.icon || null,
          categoryId: formData.categoryId || null,
        }),
      });

      if (response.ok) {
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
            URL <span className="text-destructive">*</span>
          </label>
          <input
            id="url"
            name="url"
            type="url"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.url}
            onChange={handleChange}
            required
          />
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
          <div className="flex flex-wrap gap-2 rounded-md border border-input bg-background p-3">
            {tags.map((tag) => (
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
            {tags.length === 0 && (
              <span className="text-sm text-muted-foreground">暂无标签</span>
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
