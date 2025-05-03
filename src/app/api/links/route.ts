import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 检查用户是否已登录且是管理员
    if (!session || session.user.role !== "admin") {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "未授权" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      url,
      externalUrl,
      description,
      icon,
      isInternalOnly,
      isPublic,
      categoryId,
      tagIds,
    } = body;

    // 验证必填字段
    if (!title) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "标题是必填项" },
        { status: 400 }
      );
    }

    // 验证至少提供了一个URL
    if (!url && !externalUrl) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "内网URL和外网URL至少需要提供一个" },
        { status: 400 }
      );
    }

    // 创建链接
    const link = await prisma.link.create({
      data: {
        title,
        url: url || "", // 如果没有提供内网URL，使用空字符串
        externalUrl,
        description,
        icon,
        isInternalOnly: Boolean(isInternalOnly),
        isPublic: Boolean(isPublic),
        categoryId,
        tags: tagIds?.length
          ? {
              connect: tagIds.map((id: string) => ({ id })),
            }
          : undefined,
      },
    });

    // 直接刷新首页
    await revalidatePath("/");

    return NextResponse.json<ApiResponse<{ id: string }>>(
      { success: true, data: { id: link.id } },
      { status: 201 }
    );
  } catch (error) {
    console.error("创建链接时出错:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "创建链接失败" },
      { status: 500 }
    );
  }
}
