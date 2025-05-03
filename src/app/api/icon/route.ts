import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { fetchBase64Icon, getLinkIcon, isInternalUrl } from "@/lib/utils";
import type { ApiResponse, LinkWithRelations } from "@/lib/types";
import { revalidatePath } from "next/cache";

/**
 * 获取图标API
 * 允许客户端上传已获取的图标，或请求服务端获取图标
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户权限（只有管理员可以更新图标）
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "未授权" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { linkId, iconBase64, url } = body;

    if (!linkId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "缺少必要的参数" },
        { status: 400 }
      );
    }

    // 检查链接是否存在
    const link = (await prisma.link.findUnique({
      where: { id: linkId },
      include: { tags: true }, // 确保包含关联数据以符合LinkWithRelations类型
    })) as unknown as LinkWithRelations; // 类型转换为确保类型安全

    if (!link) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "链接不存在" },
        { status: 404 }
      );
    }

    let icon = null;

    // 如果客户端提供了图标，直接使用
    if (iconBase64) {
      icon = iconBase64;
    }
    // 如果客户端提供了URL，尝试服务端获取图标
    else if (url) {
      try {
        icon = await fetchBase64Icon(url);
      } catch (error) {
        console.error(`获取图标失败: ${error}`);
        icon = null;
      }
    }
    // 尝试从链接自身的URL获取图标
    else if (link.url || link.externalUrl) {
      try {
        // 优先使用外部URL（可公网访问）
        const urlToUse = link.externalUrl || link.url;
        // 使用优化后的获取图标方法
        icon = await getLinkIcon({
          url: urlToUse,
          externalUrl: link.externalUrl,
        });
      } catch (error) {
        console.error(`获取图标失败: ${error}`);
        icon = null;
      }
    }

    // 如果成功获取到图标，更新数据库
    if (icon) {
      await prisma.link.update({
        where: { id: linkId },
        data: { icon },
      });

      // 直接刷新首页
      await revalidatePath("/");

      return NextResponse.json<ApiResponse<{ icon: string }>>(
        { success: true, data: { icon } },
        { status: 200 }
      );
    } else {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "无法获取图标" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("获取图标时出错:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "获取图标失败" },
      { status: 500 }
    );
  }
}

/**
 * 获取链接的图标
 */
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url");
    const linkId = request.nextUrl.searchParams.get("linkId");

    if (!url && !linkId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "缺少必要的参数" },
        { status: 400 }
      );
    }

    let icon = null;
    let link = null;

    // 如果提供了linkId，尝试从数据库获取
    if (linkId) {
      link = (await prisma.link.findUnique({
        where: { id: linkId },
        include: { tags: true }, // 确保包含关联数据
      })) as unknown as LinkWithRelations; // 类型转换为确保类型安全

      if (link?.icon) {
        icon = link.icon;
      }
    }

    // 如果没有找到图标但有URL或链接信息，尝试服务端获取
    if (!icon && (url || (link && (link.url || link.externalUrl)))) {
      try {
        // 确定要使用的URL，优先级: 传入的URL > 链接的外部URL > 链接的内部URL
        const urlToUse = url || (link ? link.externalUrl || link.url : "");

        if (urlToUse) {
          // 如果是内网URL，使用通用图标
          if (isInternalUrl(urlToUse)) {
            icon = "/icons/network-icon.svg";
          } else {
            // 使用优化后的获取图标方法
            icon = await getLinkIcon({
              url: urlToUse,
              externalUrl: link?.externalUrl || null,
            });
          }

          // 如果提供了linkId并获取到了图标，更新数据库
          if (linkId && icon && link) {
            await prisma.link.update({
              where: { id: linkId },
              data: { icon },
            });

            // 直接刷新首页
            await revalidatePath("/");
          }
        }
      } catch (error) {
        console.error(`服务端获取图标失败: ${error}`);
        icon = "/placeholder-icon.svg";
      }
    }

    // 返回获取到的图标或错误信息
    if (icon) {
      return NextResponse.json<ApiResponse<{ icon: string }>>(
        { success: true, data: { icon } },
        { status: 200 }
      );
    } else {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "无法获取图标" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("获取图标时出错:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "获取图标失败" },
      { status: 500 }
    );
  }
}
