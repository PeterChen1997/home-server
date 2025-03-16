import { NextRequest, NextResponse } from "next/server";
import { createCanvas } from "canvas";

/**
 * 生成默认图标的API
 * 接受参数:
 * - char: 要显示的字符(必选)
 * - name: 链接名称，用于生成颜色(可选)
 * - size: 图标大小，默认64(可选)
 * 返回PNG格式的图标
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const char = searchParams.get("char") || "A";
  const name = searchParams.get("name") || "";
  const size = parseInt(searchParams.get("size") || "64", 10);

  // 生成基于名称的HSL颜色
  let hue = 0;
  if (name) {
    // 使用简单的字符串哈希算法
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    hue = hash % 360;
    if (hue < 0) hue += 360;
  } else {
    // 基于字符的ascii码生成色相
    hue = ((char.charCodeAt(0) - 65) * 15) % 360;
    if (hue < 0) hue += 360;
  }

  // 创建Canvas绘制图标
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // 设置圆角矩形背景
  ctx.beginPath();
  const radius = size * 0.15; // 圆角半径
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();

  // 填充背景
  ctx.fillStyle = `hsl(${hue}, 70%, 70%)`;
  ctx.fill();

  // 绘制字符
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${size * 0.6}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(char.toUpperCase().charAt(0), size / 2, size / 2);

  // 转换为PNG并设置响应
  const buffer = canvas.toBuffer("image/png");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
