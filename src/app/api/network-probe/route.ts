import { NextRequest, NextResponse } from "next/server";

/**
 * 简单探测某个主机是否可达
 * 注意：此API仅在服务端与目标主机在同一网络时有效
 * 当应用部署在Vercel等云服务上时，无法直接探测客户端所在网络的可达性
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const target = searchParams.get("target");

  if (!target) {
    return NextResponse.json(
      { error: "Target parameter is required" },
      { status: 400 }
    );
  }

  // 仅允许探测私有IP地址和局域网域名
  const isValidTarget =
    /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/.test(target) ||
    target === "localhost" ||
    target.endsWith(".local") ||
    target.endsWith(".lan");

  if (!isValidTarget) {
    return NextResponse.json(
      { error: "Invalid target. Only local network targets are allowed." },
      { status: 403 }
    );
  }

  try {
    // 尝试发起请求来检测目标是否可达
    // 注意：在Vercel或其他云环境中，这个请求实际上是从云服务器发起的，
    // 而不是从客户端网络发起，因此可能无法达到预期效果
    const protocol =
      target.includes("localhost") || /^\d+\.\d+\.\d+\.\d+$/.test(target)
        ? "http"
        : "https";

    const url = `${protocol}://${target}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return NextResponse.json({
      success: true,
      target,
      isReachable: response.ok,
      statusCode: response.status,
    });
  } catch (error) {
    // 无法连接到目标
    return NextResponse.json({
      success: false,
      target,
      isReachable: false,
      error: "Connection failed",
    });
  }
}

export async function HEAD(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("target");

  if (!target) {
    return new NextResponse(null, { status: 400 });
  }

  return new NextResponse(null, { status: 200 });
}
