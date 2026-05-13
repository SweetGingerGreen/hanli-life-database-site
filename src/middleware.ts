// src/middleware.ts - stamps x-pathname so RSC layout can render the current section.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("x-pathname", req.nextUrl.pathname);
  return res;
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico|fonts/).*)"],
};
