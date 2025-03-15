import { NextResponse } from "next/server";

export async function GET() {
  // 简单的响应，仅用于测试网络连接
  return NextResponse.json({
    status: "ok",
    message: "Network connection available",
    timestamp: new Date().toISOString(),
  });
}

export async function HEAD() {
  // 同样返回200，但没有响应体
  return new NextResponse(null, { status: 200 });
}
