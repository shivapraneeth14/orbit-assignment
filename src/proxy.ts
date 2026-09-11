import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const protectedRoutes = ["/dashboard", "/project", "/workspace"];
const authRoutes = ["/login", "/signup"];

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => pathname === r);

  if (isProtected && !session?.user?.id) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && session?.user?.id) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/project/:path*",
    "/workspace/:path*",
    "/login",
    "/signup",
  ],
};
