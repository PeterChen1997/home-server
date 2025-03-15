import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { cache } from "react";
import type { ClassValue as CVAClassValue } from "class-variance-authority/types";

/**
 * 合并 Tailwind CSS 类名
 */
export function cn(...inputs: (ClassValue | CVAClassValue)[]) {
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
 * 缓存的Base64获取函数
 */
export const fetchBase64Icon = cache(async (url: string): Promise<string> => {
  try {
    // 1. 尝试从URL获取图标
    const response = await fetch(url, {
      next: { revalidate: 86400 }, // 缓存一天
      // 添加超时处理
      signal: AbortSignal.timeout(3000), // 3秒超时
    });

    if (!response.ok) {
      console.log(`Icon fetch failed for ${url}: ${response.status}`);
      return "/placeholder-icon.svg";
    }

    // 2. 将响应转换为ArrayBuffer
    const buffer = await response.arrayBuffer();

    // 3. 将ArrayBuffer转换为Base64字符串
    const base64 = Buffer.from(buffer).toString("base64");

    // 4. 确定MIME类型
    let contentType = response.headers.get("content-type") || "image/png";

    // 5. 返回适合于<img>标签的src值
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    // 简化错误日志，避免大量错误输出
    console.log(`Error loading icon: ${url}`);
    // 返回默认图标
    return "/placeholder-icon.svg";
  }
});

/**
 * 获取链接的图标URL或Base64
 */
export async function getLinkIcon(link: {
  icon?: string | null;
  url: string;
}): Promise<string> {
  // 如果已有自定义图标，优先使用
  if (link.icon) return link.icon;

  try {
    const url = new URL(link.url);
    const iconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;

    // 返回Base64编码的图标
    return await fetchBase64Icon(iconUrl);
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

/**
 * 检查当前环境是否在局域网内
 * 通过检测网络接口来判断是否在内网环境
 */
export async function isInLocalNetwork(): Promise<boolean> {
  // 在客户端组件中检测是否为局域网
  // 基于网络连接状态和Private IP检测
  if (typeof navigator !== "undefined" && "connection" in navigator) {
    const connection = (navigator as any).connection;

    // 如果使用了VPN、以太网或WiFi连接可能在内网
    if (
      connection &&
      (connection.type === "ethernet" ||
        connection.type === "wifi" ||
        connection.effectiveType === "4g")
    ) {
      // 尝试通过简单的ping测试检查是否能访问内网资源
      try {
        // 创建一个1px的透明图片请求，用于检测内网连接
        // 这个地址应该是您内网的一个服务地址
        const testUrl = "/api/network-test";
        const response = await fetch(testUrl, {
          method: "HEAD",
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        return response.ok;
      } catch (error) {
        return false;
      }
    }
  }

  // 默认情况下假设不在局域网内
  return false;
}
