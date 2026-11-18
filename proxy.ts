import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Optimistic check only: it looks for the session cookie, it does not
// validate it. Real authorization stays in app/(root)/layout.tsx and in
// every server action.
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

// Public pages: auth forms, password reset, and the unsubscribe page reached
// from an email (signed token, no session needed).
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|assets|sign-in|sign-up|forgot-password|reset-password|unsubscribe).*)",
  ],
};
