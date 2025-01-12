import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { authCheck } from "./middlewares/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/")) {
    const authResult = authCheck(request);
    if (authResult) return authResult;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
