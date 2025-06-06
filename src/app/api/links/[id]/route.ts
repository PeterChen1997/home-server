import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";

// Next.js 15的路由处理函数参数格式
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 检查用户是否已登录且是管理员
    if (!session || session.user.role !== "admin") {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "未授权" },
        { status: 401 }
      );
    }

    // 从URL路径中获取ID
    const id = request.nextUrl.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "缺少链接ID" },
        { status: 400 }
      );
    }

    // 先删除链接与标签的关联
    await prisma.link.update({
      where: { id },
      data: {
        tags: {
          set: [],
        },
      },
    });

    // 然后删除链接
    await prisma.link.delete({
      where: { id },
    });

    // 直接刷新首页
    await revalidatePath("/");

    return NextResponse.json<ApiResponse<null>>(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("删除链接时出错:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "删除链接失败" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 检查用户是否已登录且是管理员
    if (!session || session.user.role !== "admin") {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "未授权" },
        { status: 401 }
      );
    }

    // 从URL路径中获取ID
    const id = request.nextUrl.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "缺少链接ID" },
        { status: 400 }
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

    // 检查链接是否存在
    const existingLink = await prisma.link.findUnique({
      where: { id },
    });

    if (!existingLink) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "链接不存在" },
        { status: 404 }
      );
    }

    // 构建更新数据
    const updateData: any = {
      title,
      url: url || "", // 如果没有提供内网URL，使用空字符串
      description,
      icon,
      isInternalOnly: Boolean(isInternalOnly),
      isPublic: Boolean(isPublic),
      categoryId,
      tags: {
        set: [], // 先清空所有标签关联
        connect: tagIds?.length ? tagIds.map((id: string) => ({ id })) : [],
      },
    };

    // 只有当externalUrl有值时才更新它
    if (externalUrl !== undefined) {
      updateData.externalUrl = externalUrl || null;
    }

    // 更新链接
    const link = await prisma.link.update({
      where: { id },
      data: updateData,
    });

    // 直接刷新首页
    await revalidatePath("/");

    return NextResponse.json<ApiResponse<{ id: string }>>(
      { success: true, data: { id: link.id } },
      { status: 200 }
    );
  } catch (error) {
    console.error("更新链接时出错:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "更新链接失败" },
      { status: 500 }
    );
  }
}
