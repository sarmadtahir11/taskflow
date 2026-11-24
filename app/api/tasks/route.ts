
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import clientPromise from "@/lib/mongodb";
import { verifyAccessToken } from "@/lib/tokens";

// Get tasks collection
async function getTasksCollection() {
  const client = await clientPromise;
  const db = client.db("taskflow");
  return db.collection("tasks");
}

// Get logged-in user's ID
async function getLoggedInUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = verifyAccessToken(token) as {
      userId: string;
    };

    if (!decoded.userId || !ObjectId.isValid(decoded.userId)) {
      return null;
    }

    return decoded.userId;
  } catch {
    return null;
  }
}

// Common authentication check
async function checkAuthentication() {
  const userId = await getLoggedInUserId();

  if (!userId) {
    return {
      userId: null,
      error: NextResponse.json(
        { error: "Unauthorized. Please login." },
        { status: 401 }
      ),
    };
  }

  return {
    userId,
    error: null,
  };
}

// GET - Fetch only logged-in user's tasks
export async function GET() {
  try {
    const auth = await checkAuthentication();

    if (auth.error) {
      return auth.error;
    }

    const userId = auth.userId!;
    const collection = await getTasksCollection();

    const tasks = await collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(tasks);

  } catch (error) {
    console.error("GET Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST - Create task for logged-in user
export async function POST(request: Request) {
  try {
    const auth = await checkAuthentication();

    if (auth.error) {
      return auth.error;
    }

    const userId = auth.userId!;
    const body = await request.json();

    if (
      !body.title ||
      typeof body.title !== "string" ||
      !body.title.trim()
    ) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    const allowedPriorities = ["High", "Medium", "Low"];

    if (!allowedPriorities.includes(body.priority)) {
      return NextResponse.json(
        { error: "Please select a valid task priority" },
        { status: 400 }
      );
    }

    const collection = await getTasksCollection();

    const newTask = {
      userId,
      title: body.title.trim(),
      description:
        typeof body.description === "string"
          ? body.description
          : "",
      completed: false,
      priority: body.priority,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newTask);

    return NextResponse.json(
      {
        message: "Task added successfully",
        task: {
          ...newTask,
          _id: result.insertedId,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST Error:", error);

    return NextResponse.json(
      { error: "Failed to add task" },
      { status: 500 }
    );
  }
}

// PUT - Update only logged-in user's task
export async function PUT(request: Request) {
  try {
    const auth = await checkAuthentication();

    if (auth.error) {
      return auth.error;
    }

    const userId = auth.userId!;
    const body = await request.json();

    if (!body.id || !ObjectId.isValid(body.id)) {
      return NextResponse.json(
        { error: "Valid task ID is required" },
        { status: 400 }
      );
    }

    const updates: {
      title?: string;
      description?: string;
      completed?: boolean;
      priority?: string;
    } = {};

    if (body.title !== undefined) {
      if (
        typeof body.title !== "string" ||
        !body.title.trim()
      ) {
        return NextResponse.json(
          { error: "Valid task title is required" },
          { status: 400 }
        );
      }

      updates.title = body.title.trim();
    }

    if (body.description !== undefined) {
      if (typeof body.description !== "string") {
        return NextResponse.json(
          { error: "Invalid description" },
          { status: 400 }
        );
      }

      updates.description = body.description;
    }

    if (body.completed !== undefined) {
      if (typeof body.completed !== "boolean") {
        return NextResponse.json(
          { error: "Invalid completed value" },
          { status: 400 }
        );
      }

      updates.completed = body.completed;
    }

    if (body.priority !== undefined) {
      const allowedPriorities = ["High", "Medium", "Low"];

      if (!allowedPriorities.includes(body.priority)) {
        return NextResponse.json(
          { error: "Invalid priority" },
          { status: 400 }
        );
      }

      updates.priority = body.priority;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid updates provided" },
        { status: 400 }
      );
    }

    const collection = await getTasksCollection();

    const result = await collection.updateOne(
      {
        _id: new ObjectId(body.id),
        userId,
      },
      {
        $set: updates,
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Task not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Task updated successfully",
      modifiedCount: result.modifiedCount,
    });

  } catch (error) {
    console.error("PUT Error:", error);

    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE - Delete only logged-in user's task
export async function DELETE(request: Request) {
  try {
    const auth = await checkAuthentication();

    if (auth.error) {
      return auth.error;
    }

    const userId = auth.userId!;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Valid task ID is required" },
        { status: 400 }
      );
    }

    const collection = await getTasksCollection();

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
      userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Task not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Task deleted successfully",
      deletedCount: result.deletedCount,
    });

  } catch (error) {
    console.error("DELETE Error:", error);

    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
