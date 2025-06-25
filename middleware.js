import { NextResponse } from "next/server";

export function middleware(request) {
  const url = request.nextUrl.clone();
  const password = "grwthruothers";
  const cookie = request.cookies.get("eventapp_auth");

  if (cookie?.value === password) {
    return NextResponse.next(); // Allow access
  }

  url.pathname = "/login.html";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!login\\.html|_next|favicon\\.ico|assets|style\\.css|app\\.js).*)"],
};
