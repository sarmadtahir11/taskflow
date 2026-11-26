
import { NextRequest, NextResponse } from "next/server";

import {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
} from "@/lib/tokens";

// Verify token and get user ID
function getUserId(
  token: string | undefined,
  verifyToken: (token: string) => unknown
): string | null {
  if (!token) {
    return null;
  }

  try {
    const decoded = verifyToken(token);

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded &&
      typeof decoded.userId === "string" &&
      decoded.userId.length > 0
    ) {
      return decoded.userId;
    }

    return null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // First check access token
  let userId = getUserId(accessToken, verifyAccessToken);

  let newAccessToken: string | null = null;

  // If access token is invalid, check refresh token
  if (!userId) {
    userId = getUserId(refreshToken, verifyRefreshToken);

    if (userId) {
      newAccessToken = generateAccessToken(userId);
    }
  }

  const isAuthenticated = Boolean(userId);

  const isDashboard = pathname.startsWith("/dashboard");

  const isPublicPage =
    pathname === "/signin" || pathname === "/signup";

  // Protect dashboard
  if (isDashboard && !isAuthenticated) {
    const response = NextResponse.redirect(
      new URL("/signin", request.url)
    );

    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");

    return response;
  }

  // Redirect logged-in users away from signin/signup
  if (isPublicPage && isAuthenticated) {
    const response = NextResponse.redirect(
      new URL("/dashboard", request.url)
    );

    if (newAccessToken) {
      response.cookies.set("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60,
      });
    }

    return response;
  }

  // Allow the request
  const response = NextResponse.next();

  // Save refreshed access token if needed
  if (newAccessToken) {
    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/signin", "/signup"],
};
