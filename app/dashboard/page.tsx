
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

// Task ka structure define kar rahe hain
interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export default function Dashboard() {

  // Tasks ki initial list
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Learn TypeScript", completed: false },
    { id: 2, title: "Practice Next.js", completed: true },
    { id: 3, title: "Build Landing Page", completed: false },
  ]);

  const [newTask, setNewTask] = useState("");

  // New task add karna
  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newTask.trim()) return;

    const task: Task = {
      id: Date.now(),
      title: newTask,
      completed: false,
    };

    setTasks((previousTasks) => [...previousTasks, task]);
    setNewTask("");
  }

  // Task complete ya incomplete karna
  function toggleTask(id: number) {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  // Statistics calculate karna
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
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
          >
            Add Task
          </button>

        </form>
      </section>

      {/* Task List */}
      <section className="mt-8 rounded-xl bg-slate-900 p-6">

        <h3 className="text-xl font-bold">My Tasks</h3>

        <div className="mt-5 space-y-3">

          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-lg bg-slate-800 p-4"
            >

              <span
                className={
                  task.completed
                    ? "text-slate-500 line-through"
                    : "text-white"
                }
              >
                {task.title}
              </span>

              <button
                onClick={() => toggleTask(task.id)}
                className={`rounded-lg px-3 py-2 text-sm ${
                  task.completed
                    ? "bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {task.completed ? "Completed" : "Complete"}
              </button>

            </div>
          ))}

        </div>
      </section>

    </main>
  );
}
