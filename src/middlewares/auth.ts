import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { COOKIES } from "@/constants/cookies";

export function authCheck(request: NextRequest): NextResponse | null {
  const token = request.cookies.get(COOKIES.USER_TOKEN);
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return null;
}
