import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/forum(.*)"]);

export default clerkMiddleware((auth, req: NextRequest) => {
  if (isProtectedRoute(req)) auth().protect();

  const userAgent = req.headers.get("user-agent") || "";
  const isMobile = /mobile/i.test(userAgent);
  const url = req.nextUrl.clone();

  if (url.pathname === "/customize") {
    if (isMobile) {
      url.pathname = "/customize/mobile";
      return NextResponse.redirect(url);
    } else {
      url.pathname = "/customize/desktop";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
