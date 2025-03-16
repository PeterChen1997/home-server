import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/lib/types";

/**
 * 代理服务器获取网站图标API
 * 用于解决客户端CORS限制问题
 */
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "缺少URL参数" },
        { status: 400 }
      );
    }

    // 构建谷歌favicon API的URL
    const apiUrl = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
      url
    )}&size=32`;

    // 服务器端请求不受CORS限制
    const response = await fetch(apiUrl, { cache: "force-cache" });

    if (!response.ok) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: `获取图标失败: ${response.status}` },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    // 根据响应的content-type判断图片类型，默认为png
    const contentType = response.headers.get("content-type") || "image/png";
    const iconData = `data:${contentType};base64,${base64}`;

    return NextResponse.json<ApiResponse<{ icon: string }>>(
      { success: true, data: { icon: iconData } },
      { status: 200 }
    );
  } catch (error) {
    console.error("代理图标请求失败:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "获取图标时出错" },
      { status: 500 }
    );
  }
}
