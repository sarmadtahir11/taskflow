
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/taskService";

interface Task {
  _id: string;
  title: string;
  completed: boolean;
  priority?: string;
}

export default function Dashboard() {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  // Get tasks from database
  async function fetchTasks() {
    try {
      setError("");

      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.log(error);
      setError("Could not load tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  // Logout user
  async function handleLogout() {
    try {
      setLoggingOut(true);
      setError("");

      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      window.location.href = "/signin";

    } catch (error) {
      console.log(error);
      setError("Could not logout. Please try again.");
      setLoggingOut(false);
    }
  }

  // Add new task
  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newTask.trim() || !priority) {
      setError("Please enter task name and priority.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = await createTask(newTask.trim(), priority);

      setTasks((previousTasks) => [data.task, ...previousTasks]);

      setNewTask("");
      setPriority("");
    } catch (error) {
      console.log(error);
      setError("Could not add task.");
    } finally {
      setSaving(false);
    }
  }

  // Complete or undo task
  async function toggleTask(task: Task) {
    try {
      setError("");

      await updateTask(task._id, !task.completed);

      setTasks((previousTasks) =>
        previousTasks.map((item) =>
          item._id === task._id
            ? { ...item, completed: !item.completed }
            : item
        )
      );
    } catch (error) {
      console.log(error);
      setError("Could not update task.");
    }
  }

  // Delete task
  async function removeTask(id: string) {
    try {
      setError("");

      await deleteTask(id);

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task._id !== id)
      );
    } catch (error) {
      console.log(error);
      setError("Could not delete task.");
    }
  }

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

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-700 disabled:opacity-50"
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </header>

      {/* Dashboard Heading */}
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

          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            required
            className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-500"
          >
            <option value="" disabled>
              Select Priority
            </option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

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
                    Priority: {task.priority || "Not set"}
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
                    onClick={() => removeTask(task._id)}
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
