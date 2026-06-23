import { NextResponse, type NextRequest } from "next/server";
import { isCourseLevel, isProtectedModule } from "@/lib/access-control";

const routeModuleMap: Record<string, "course" | "word_bubble" | "scenario"> = {
  "/dashboard": "course",
  "/word-link": "word_bubble",
  "/scenarios": "scenario",
};

function hasSupabaseSessionCookie(request: NextRequest) {
  return request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const targetModule = request.nextUrl.searchParams.get("targetModule") ?? routeModuleMap[pathname];
  const targetLevel = request.nextUrl.searchParams.get("targetLevel") ?? request.nextUrl.searchParams.get("level");

  if (!isProtectedModule(targetModule) || !isCourseLevel(targetLevel) || targetLevel === "A0") {
    return NextResponse.next();
  }

  if (hasSupabaseSessionCookie(request)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/pricing";
  url.searchParams.set("lockedLevel", targetLevel);
  url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard", "/word-link", "/scenarios"],
};
