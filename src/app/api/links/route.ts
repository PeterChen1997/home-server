import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

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
      description,
      icon,
      isInternalOnly,
      isPublic,
      categoryId,
      tagIds,
    } = body;

    // 验证必填字段
    if (!title || !url) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "标题和URL是必填项" },
        { status: 400 }
      );
    }

    // 创建链接
    const link = await prisma.link.create({
      data: {
        title,
        url,
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
