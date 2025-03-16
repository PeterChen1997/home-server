import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 检查URL是否为内部地址
 */
export function isInternalUrl(url: string): boolean {
  if (!url) return false;

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    return (
      hostname === "localhost" ||
      hostname.startsWith("127.0.0.1") ||
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
 * 检查URL是否在本地网络
 */
export function isInLocalNetwork(url: string): boolean {
  return isInternalUrl(url);
}

/**
 * 检查本地网络URL是否可访问
 */
export async function isUrlAccessibleInLocalNetwork(
  url: string
): Promise<boolean> {
  if (!url) return false;

  try {
    const response = await fetch(url, {
      method: "HEAD",
      credentials: "include",
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });

    return response.ok;
  } catch (e) {
    return false;
  }
}

/**
 * 获取链接图标
 * 优先从外部URL获取，如果外部URL没有提供或获取失败，尝试从内部URL获取
 */
export async function getLinkIcon(options: {
  url: string;
  externalUrl?: string | null;
}): Promise<string> {
  const { url, externalUrl } = options;

  let icon: string | null = null;

  // 尝试从外部URL获取图标
  if (externalUrl) {
    try {
      icon = await fetchBase64Icon(externalUrl);
    } catch (error) {
      console.log("无法从外部URL获取图标, 尝试内部URL", error);
    }
  }

  // 如果外部URL没有提供或获取失败，尝试从内部URL获取
  if (!icon && url) {
    try {
      icon = await fetchBase64Icon(url);
    } catch (error) {
      console.log("无法从内部URL获取图标", error);
    }
  }

  // 如果仍然没有图标，返回默认图标
  if (!icon) {
    return "/placeholder-icon.svg";
  }

  return icon;
}

/**
 * 从URL中获取网站图标，转为base64
 * 使用服务器端代理获取图标，避免CORS问题
 */
export async function fetchBase64Icon(url: string): Promise<string> {
  try {
    // 在服务器环境中
    if (typeof window === "undefined") {
      const apiUrl = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
        url
      )}&size=32`;

      const response = await fetch(apiUrl, { cache: "force-cache" });

      if (!response.ok) {
        throw new Error(`获取图标失败: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString("base64");

      // 根据响应的content-type判断图片类型，默认为png
      const contentType = response.headers.get("content-type") || "image/png";

      return `data:${contentType};base64,${base64}`;
    }
    // 在客户端环境中，使用我们的代理API
    else {
      // 使用我们的API代理获取图标，避免CORS问题
      const proxyUrl = `/api/proxy-icon?url=${encodeURIComponent(url)}`;

      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`通过代理获取图标失败: ${response.status}`);
      }

      const data = await response.json();
      return data.icon || "/placeholder-icon.svg";
    }
  } catch (error) {
    console.error("获取icon错误:", error);
    throw error;
  }
}
