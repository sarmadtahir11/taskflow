import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <nav className="flex items-center justify-between px-10 py-6">
        <h1 className="text-2xl font-bold text-blue-400">
          TaskFlow
        </h1>
        <div className="flex gap-4">

      
        <Link
          href="/signin"
          className="rounded-lg bg-blue-600 px-6 py-2 hover:bg-blue-700"
        >
          Sign In
        </Link>
        </div>
      </nav>

      <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">

        <h2 className="max-w-3xl text-5xl font-bold">
          Manage Your Tasks.
          <span className="text-blue-400"> Achieve More.</span>
        </h2>

        <p className="mt-6 max-w-xl text-lg text-gray-400">
          Organize your daily work, track your progress
          and stay productive with TaskFlow.
        </p>

        <Link
          href="/signin"
          className="mt-8 rounded-lg bg-blue-600 px-8 py-3 font-semibold hover:bg-blue-700"
        >
          Get Started
        </Link>

      </section>

      <section className="grid gap-6 px-10 pb-16 md:grid-cols-3">

        <div className="rounded-xl bg-slate-900 p-8">
          <h3 className="text-xl font-bold">Organize Tasks</h3>
          <p className="mt-3 text-gray-400">
            Manage all your tasks in one place.
          </p>
        </div>

        <div className="rounded-xl bg-slate-900 p-8">
          <h3 className="text-xl font-bold">Track Progress</h3>
          <p className="mt-3 text-gray-400">
            Monitor your daily productivity.
          </p>
        </div>

        <div className="rounded-xl bg-slate-900 p-8">
          <h3 className="text-xl font-bold">Stay Productive</h3>
          <p className="mt-3 text-gray-400">
            Complete your work on time.
          </p>
        </div>

      </section>

    </main>
  );
}
