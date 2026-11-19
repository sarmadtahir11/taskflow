
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, password } = body;

    // Validate fields
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Connect to database
    const client = await clientPromise;
    const db = client.db("taskflow");
    const collection = db.collection("users");

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing user
    const existingUser = await collection.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date(),
    };

    // Save in database
    const result = await collection.insertOne(newUser);

    return NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: result.insertedId,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration Error:", error);

    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
