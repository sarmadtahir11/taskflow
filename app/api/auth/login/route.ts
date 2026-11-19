
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";


import {
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/tokens";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { email, password } = body;

    // 1. Validate fields
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // 2. Connect to database
    const client = await clientPromise;
    const db = client.db("taskflow");
    const collection = db.collection("users");

    // 3. Find user by email
    const user = await collection.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 4. Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 5. Generate tokens
    const accessToken = generateAccessToken(
      user._id.toString()
    );

    const refreshToken = generateRefreshToken(
      user._id.toString()
    );

    // 6. Create response
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 }
    );

    // 7. Save tokens in HttpOnly cookies
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;

  } catch (error) {
    console.error("Login Error:", error);

    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
