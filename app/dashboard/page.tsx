
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

interface Task {
  _id: string;
  title: string;
  completed: boolean;
  priority?: string;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load tasks from MongoDB
  async function fetchTasks() {
    try {
      setError("");

      const response = await fetch("/api/tasks", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load tasks");
      }

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
      setError("Could not load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add new task to MongoDB
  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newTask.trim()) return;

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTask.trim(),
          priority: "Medium",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add task");
      }

      const data = await response.json();

      setTasks((previousTasks) => [
        data.task,
        ...previousTasks,
      ]);

      setNewTask("");
    } catch (err) {
      console.error(err);
      setError("Could not add task. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // Toggle task completion in MongoDB
  async function toggleTask(task: Task) {
    try {
      setError("");

      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: task._id,
          completed: !task.completed,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      setTasks((previousTasks) =>
        previousTasks.map((item) =>
          item._id === task._id
            ? { ...item, completed: !item.completed }
            : item
        )
      );
    } catch (err) {
      console.error(err);
      setError("Could not update task. Please try again.");
    }
  }

  // Delete task from MongoDB
  async function deleteTask(id: string) {
    try {
      setError("");

      const response = await fetch(
        `/api/tasks?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task._id !== id)
      );
    } catch (err) {
      console.error(err);
      setError("Could not delete task. Please try again.");
    }
  }

  // Calculate statistics
  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">

      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-400">
          TaskFlow
        </h1>

        <Link
          href="/"
          className="rounded-lg bg-slate-800 px-4 py-2 hover:bg-slate-700"
        >
          Logout
        </Link>
      </header>

      {/* Welcome Section */}
      <section className="mt-10">
        <h2 className="text-3xl font-bold">Dashboard</h2>

        <p className="mt-2 text-slate-400">
          Welcome! Manage your daily tasks here.
        </p>
      </section>

      {/* Statistics */}
      <section className="mt-8 grid gap-5 md:grid-cols-3">

        <div className="rounded-xl bg-slate-900 p-6">
          <p className="text-slate-400">Total Tasks</p>
          <h3 className="mt-2 text-3xl font-bold">
            {tasks.length}
          </h3>
        </div>

        <div className="rounded-xl bg-slate-900 p-6">
          <p className="text-slate-400">Completed</p>
          <h3 className="mt-2 text-3xl font-bold text-green-400">
            {completedTasks}
          </h3>
        </div>

        <div className="rounded-xl bg-slate-900 p-6">
          <p className="text-slate-400">Pending</p>
          <h3 className="mt-2 text-3xl font-bold text-yellow-400">
            {tasks.length - completedTasks}
          </h3>
        </div>

      </section>

      {/* Add Task Form */}
      <section className="mt-10 rounded-xl bg-slate-900 p-6">

        <h3 className="text-xl font-bold">Add New Task</h3>

        <form
          onSubmit={addTask}
          className="mt-4 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
            placeholder="Enter task name"
            required
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add Task"}
          </button>
        </form>
      </section>

      {/* Error Message */}
      {error && (
        <p className="mt-5 rounded-lg bg-red-900/40 p-3 text-red-300">
          {error}
        </p>
      )}

      {/* Task List */}
      <section className="mt-8 rounded-xl bg-slate-900 p-6">

        <h3 className="text-xl font-bold">My Tasks</h3>

        <div className="mt-5 space-y-3">

          {loading ? (
            <p className="text-slate-400">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="text-slate-400">
              No tasks found. Add your first task!
            </p>
          ) : (
            tasks.map((task) => (
              <div
                key={task._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-800 p-4"
              >
                <div>
                  <span
                    className={
                      task.completed
                        ? "text-slate-500 line-through"
                        : "text-white"
                    }
                  >
                    {task.title}
                  </span>

                  <p className="mt-1 text-xs text-slate-400">
                    Priority: {task.priority || "Medium"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleTask(task)}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      task.completed
                        ? "bg-green-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {task.completed ? "Completed" : "Complete"}
                  </button>

                  <button
                    onClick={() => deleteTask(task._id)}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}

        </div>
      </section>

    </main>
  );
}
