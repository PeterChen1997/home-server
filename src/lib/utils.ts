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
    // 1. 首先尝试正常模式获取图标
    try {
      const response = await fetch(url, {
        next: { revalidate: 86400 }, // 缓存一天
        // 添加超时处理
        signal: AbortSignal.timeout(2000), // 2秒超时
      });

      if (response.ok) {
        // 2. 将响应转换为ArrayBuffer
        const buffer = await response.arrayBuffer();
        // 3. 将ArrayBuffer转换为Base64字符串
        const base64 = Buffer.from(buffer).toString("base64");
        // 4. 确定MIME类型
        let contentType = response.headers.get("content-type") || "image/png";
        // 5. 返回适合于<img>标签的src值
        return `data:${contentType};base64,${base64}`;
      }
      // 如果常规请求失败，继续尝试no-cors模式
    } catch (error) {
      // 常规请求失败，继续尝试no-cors模式
      console.log(`Normal fetch failed for ${url}, trying no-cors mode`);
    }

    // 使用客户端的Image元素作为后备方案（针对浏览器环境）
    if (typeof window !== "undefined") {
      // 直接返回原始URL，让浏览器尝试加载
      // 这在客户端代码中更有效，特别是对于可能有CORS限制的图标
      return url;
    }

    // 服务器端默认返回占位图标
    return "/placeholder-icon.svg";
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

    // 检查是否为内部网络IP地址
    if (isInternalUrl(url.toString())) {
      // 对于内部网络链接，使用通用的图标
      return "/icons/network-icon.svg";
    }

    // 对于普通网站使用Google的favicon服务
    const iconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;

    // 尝试使用no-cors模式获取图标
    try {
      return await fetchBase64Icon(iconUrl);
    } catch (fetchError) {
      // 如果无法获取，则使用本地图标
      console.log(
        `Failed to fetch icon with regular fetch, using placeholder: ${fetchError}`
      );
      return "/placeholder-icon.svg";
    }
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
 * 检查目标URL是否在当前局域网可访问
 * 分别尝试不同的方法检测可达性
 */
export async function isUrlAccessibleInLocalNetwork(
  url: string
): Promise<boolean> {
  // 如果不是内部URL，则总是可访问
  if (!isInternalUrl(url)) {
    return true;
  }

  try {
    // 1. 尝试通过API检测客户端网络环境
    const networkEnvResponse = await fetch("/api/network-test", {
      method: "GET",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });

    if (!networkEnvResponse.ok) {
      return false;
    }

    const networkData = await networkEnvResponse.json();

    // 2. 提取客户端IP和网络信息
    const clientIp = networkData.clientIp || "";
    const networkInfo = networkData.networkInfo || {};

    // 解析目标URL的主机名
    const targetHost = new URL(url).hostname;

    // 3. 检查客户端IP和目标主机是否在同一子网
    if (clientIp.startsWith("192.168.") && targetHost.startsWith("192.168.")) {
      // 提取子网部分 (192.168.X)
      const clientSubnet = clientIp.split(".").slice(0, 3).join(".");
      const targetSubnet = targetHost.split(".").slice(0, 3).join(".");

      if (clientSubnet === targetSubnet) {
        return true;
      }
    }

    // 4. 对于特定的内网域名后缀，如果客户端有本地网络连接，假设可访问
    if (
      (targetHost.endsWith(".local") || targetHost.endsWith(".lan")) &&
      (networkInfo.hasWifi || networkInfo.hasEthernet)
    ) {
      return true;
    }

    // 5. 尝试通过服务端代理进行ping测试（仅适用于同一子网的服务端）
    try {
      const probeResponse = await fetch(
        `/api/network-probe?target=${encodeURIComponent(targetHost)}`,
        {
          method: "HEAD",
          cache: "no-store",
          signal: AbortSignal.timeout(2000), // 2秒超时
        }
      );

      return probeResponse.ok;
    } catch (error) {
      // ping测试失败
    }

    // 默认情况下，假设不可访问
    return false;
  } catch (error) {
    console.error("Error checking network accessibility:", error);
    return false;
  }
}

/**
 * 检查当前客户端是否在局域网环境
 */
export async function isInLocalNetwork(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false; // 服务端渲染时默认为false
  }

  try {
    // 检测客户端网络环境
    const response = await fetch("/api/network-test", {
      method: "HEAD",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });

    if (!response.ok) {
      return false;
    }

    // 在实际部署环境中，可以从响应中获取更多网络信息
    // 这里简单地根据响应判断客户端处于局域网环境
    return true;
  } catch (error) {
    console.error("Network detection error:", error);
    return false;
  }
}
