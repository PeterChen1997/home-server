import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import type { ApiResponse, LinkWithRelations } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query) {
      return NextResponse.json<ApiResponse<LinkWithRelations[]>>(
        { success: true, data: [] },
        { status: 200 }
      );
    }

    // 构建搜索条件
    const where: any = {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { url: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
      isPublic: true, // 只搜索公开链接
    };

    // 如果用户未登录，不显示内部链接
    if (!session) {
      where.isInternalOnly = false;
    }

    const links = await prisma.link.findMany({
      where,
      include: {
        category: true,
        tags: true,
      },
      orderBy: {
        title: "asc",
      },
    });

    return NextResponse.json<ApiResponse<LinkWithRelations[]>>(
      { success: true, data: links as LinkWithRelations[] },
      { status: 200 }
    );
  } catch (error) {
    console.error("搜索链接时出错:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "搜索失败" },
      { status: 500 }
    );
  }
}
