import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 获取特定分类
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        links: {
          select: {
            id: true,
            title: true,
            url: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "分类不存在" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("获取分类失败:", error);
    return NextResponse.json({ error: "获取分类失败" }, { status: 500 });
  }
}

// 更新分类
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证用户是否已登录且是管理员
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, color } = body;

    // 验证必填字段
    if (!name) {
      return NextResponse.json({ error: "分类名称是必填项" }, { status: 400 });
    }

    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: "分类不存在" }, { status: 404 });
    }

    // 检查新名称是否与其他分类冲突
    if (name !== existingCategory.name) {
      const nameConflict = await prisma.category.findUnique({
        where: { name },
      });

      if (nameConflict) {
        return NextResponse.json({ error: "分类名称已存在" }, { status: 400 });
      }
    }

    // 更新分类
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        color,
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("更新分类失败:", error);
    return NextResponse.json({ error: "更新分类失败" }, { status: 500 });
  }
}

// 删除分类
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证用户是否已登录且是管理员
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;

    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        links: {
          select: { id: true },
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: "分类不存在" }, { status: 404 });
    }

    // 更新使用此分类的链接，将其分类设为null
    if (existingCategory.links.length > 0) {
      await prisma.link.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      });
    }

    // 删除分类
    await prisma.category.delete({
      where: { id },
    });

    // 直接刷新首页
    await revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除分类失败:", error);
    return NextResponse.json({ error: "删除分类失败" }, { status: 500 });
  }
}
