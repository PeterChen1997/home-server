import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isInternalUrl } from "@/lib/utils";
import type { ApiResponse } from "@/lib/types";

/**
 * 本地内网图标获取API
 * 此API假设调用方在内网环境中，用于获取内网站点的图标
 * 客户端必须提供获取到的图标的Base64数据，服务端只负责存储
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { linkId, iconBase64 } = body;

    if (!linkId || !iconBase64 || !iconBase64.startsWith("data:")) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "缺少必要的参数" },
        { status: 400 }
      );
    }

    // 检查链接是否存在
    const link = await prisma.link.findUnique({
      where: { id: linkId },
    });

    if (!link) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "链接不存在" },
        { status: 404 }
      );
    }

    // 验证这是一个内网链接
    if (link.url && !isInternalUrl(link.url)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "此API仅用于内网链接" },
        { status: 400 }
      );
    }

    // 更新链接的图标
    await prisma.link.update({
      where: { id: linkId },
      data: { icon: iconBase64 },
    });

    return NextResponse.json<ApiResponse<{ success: true }>>(
      { success: true, data: { success: true } },
      { status: 200 }
    );
  } catch (error) {
    console.error("处理本地图标时出错:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "处理本地图标失败" },
      { status: 500 }
    );
  }
}
