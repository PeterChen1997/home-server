import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // 获取客户端IP
  const clientIp =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for") ||
    "unknown";

  // 检查是否为私有IP（局域网IP）
  const isPrivateIp =
    /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/.test(clientIp) ||
    clientIp === "127.0.0.1" ||
    clientIp === "::1";

  return NextResponse.json({
    success: true,
    clientIp,
    isPrivateNetwork: isPrivateIp,
    networkInfo: {
      // 这些信息在服务端无法完全确定，可以在客户端JavaScript进一步丰富
      hasWifi: isPrivateIp, // 假设私有IP可能有WiFi
      hasEthernet: isPrivateIp, // 假设私有IP可能有以太网
    },
    timestamp: new Date().toISOString(),
  });
}

export async function HEAD(request: NextRequest) {
  // 同样返回200，但没有响应体
  return new NextResponse(null, { status: 200 });
}
