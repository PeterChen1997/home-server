import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 Tailwind CSS 类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化日期为本地字符串
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * 获取链接的图标URL
 */
export function getLinkIcon(link: {
  icon?: string | null;
  url: string;
}): string {
  if (link.icon) return link.icon;

  try {
    const url = new URL(link.url);
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
  } catch (e) {
    return "/placeholder-icon.svg";
  }
}

/**
 * 检查URL是否为内部网络
 */
export function isInternalUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    return (
      hostname === "localhost" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".lan")
    );
  } catch (e) {
    return false;
  }
}
