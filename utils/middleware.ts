import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const url = req.nextUrl.clone();

  if (!token) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const user = verifyToken(token);
  if (!user) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
