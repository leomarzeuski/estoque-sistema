import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { authCheck } from "./middlewares/auth";

export function middleware(request: NextRequest) {
  const authResult = authCheck(request);
  if (authResult) return authResult;

  return NextResponse.next();
}

export const config = {
  // Protege as telas internas do app.
  matcher: [
    "/",
    "/produtos/:path*",
    "/venda",
    "/vendas",
    "/clientes",
    "/historico",
    "/graficos",
    "/conferencia",
    "/configuracoes",
  ],
};
