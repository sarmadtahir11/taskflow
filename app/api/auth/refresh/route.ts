
import { NextResponse } from "next/server";
import {
  verifyRefreshToken,
  generateAccessToken,
} from "@/lib/tokens";

export async function POST(request: Request) {
  try {
    // 1. Get refresh token from cookies
    const cookieHeader = request.headers.get("cookie") || "";

    const refreshToken = cookieHeader
      .split("; ")
      .find((cookie) => cookie.startsWith("refreshToken="))
      ?.split("=")
      .slice(1)
      .join("=");

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token missing" },
        { status: 401 }
      );
    }

    // 2. Verify refresh token
    const decoded = verifyRefreshToken(
      decodeURIComponent(refreshToken)
    );

    if (
      typeof decoded !== "object" ||
      !("userId" in decoded) ||
      typeof decoded.userId !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    // 3. Generate new access token
    const newAccessToken = generateAccessToken(
      decoded.userId
    );

    // 4. Save new access token in cookie
    const response = NextResponse.json({
      message: "Access token refreshed successfully",
    });

    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    return response;

  } catch (error) {
    console.error("Refresh Token Error:", error);

    return NextResponse.json(
      { error: "Invalid or expired refresh token" },
      { status: 401 }
    );
  }
}
