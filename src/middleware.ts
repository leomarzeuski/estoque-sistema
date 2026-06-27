import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { authCheck } from "./middlewares/auth";

export function middleware(request: NextRequest) {
  const authResult = authCheck(request);
  if (authResult) return authResult;

  return NextResponse.next();
}

export const config = {
  // Protege a tela de estoque, as telas de produtos e os ajustes.
  matcher: ["/", "/produtos/:path*", "/configuracoes"],
};
