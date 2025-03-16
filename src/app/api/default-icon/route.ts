import { NextRequest, NextResponse } from "next/server";

// 设置缓存控制头
export const revalidate = 3600; // 缓存1小时

/**
 * 生成默认图标的API
 * 接受参数:
 * - char: 要显示的字符(必选)
 * - name: 链接名称，用于生成颜色(可选)
 * - size: 图标大小，默认64(可选)
 * 返回PNG格式的图标
 */
export async function GET(request: NextRequest) {
  try {
    // 从查询参数中获取字符
    const searchParams = request.nextUrl.searchParams;
    const char = searchParams.get("char") || "A";
    const name = searchParams.get("name") || "";

    // 简单的哈希函数为不同的名称生成不同的颜色
    const getColorFromString = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }

      const hue = Math.abs(hash % 360);
      return `hsl(${hue}, 70%, 60%)`;
    };

    // 基于名称生成背景色
    const bgColor = getColorFromString(name || char);
    // 为了确保文本可见，文本颜色使用白色
    const textColor = "#FFFFFF";

    // 创建SVG字符图标
    const svg = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="6" fill="${bgColor}" />
        <text 
          x="16" 
          y="16" 
          font-family="Arial, sans-serif" 
          font-size="16" 
          font-weight="bold" 
          fill="${textColor}" 
          text-anchor="middle" 
          dominant-baseline="central"
        >
          ${char.charAt(0).toUpperCase()}
        </text>
      </svg>
    `;

    // 返回SVG，设置适当的内容类型
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("生成默认图标出错:", error);

    // 发生错误时返回一个简单的默认图标
    const fallbackSvg = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="6" fill="#E5E7EB" />
        <text 
          x="16" 
          y="16" 
          font-family="Arial, sans-serif" 
          font-size="16" 
          font-weight="bold" 
          fill="#9CA3AF" 
          text-anchor="middle" 
          dominant-baseline="central"
        >
          ?
        </text>
      </svg>
    `;

    return new NextResponse(fallbackSvg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
}
