export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const { tag } = await request.json();
    if (!tag) {
      return NextResponse.json(
        { success: false, error: "缺少 tag" },
        { status: 400 }
      );
    }
    await revalidateTag(tag);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
