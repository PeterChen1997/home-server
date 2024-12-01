import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // const token = request.cookies.get("auth-token");

  // if (!token && !request.nextUrl.pathname.startsWith("/api")) {
  //   return NextResponse.redirect(new URL("/", request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
