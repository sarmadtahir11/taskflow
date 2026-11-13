
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

// Connect to database
async function getTasksCollection() {
  const client = await clientPromise;
  const db = client.db("taskflow");
  return db.collection("tasks");
}

// GET: Fetch all tasks
export async function GET() {
  try {
    const collection = await getTasksCollection();

    const tasks = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json(tasks);
  } catch (error) {
    console.error("GET Error:", error);
    return Response.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST: Add a new task
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || typeof body.title !== "string") {
      return Response.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    const collection = await getTasksCollection();

    const newTask = {
      title: body.title.trim(),
      description: body.description || "",
      completed: false,
      priority: body.priority || "Medium",
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newTask);

    return Response.json(
      { message: "Task added successfully", task: { ...newTask, _id: result.insertedId } },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Error:", error);
    return Response.json(
      { error: "Failed to add task" },
      { status: 500 }
    );
  }
}

// PUT: Update a task
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.id || !ObjectId.isValid(body.id)) {
      return Response.json(
        { error: "Valid task ID is required" },
        { status: 400 }
      );
    }

    const collection = await getTasksCollection();

    const { id, ...updates } = body;
    delete updates._id;

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    return Response.json({
      message: "Task updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("PUT Error:", error);
    return Response.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a task
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !ObjectId.isValid(id)) {
      return Response.json(
        { error: "Valid task ID is required" },
        { status: 400 }
      );
    }

    const collection = await getTasksCollection();

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
    });

    return Response.json({
      message: "Task deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("DELETE Error:", error);
    return Response.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
