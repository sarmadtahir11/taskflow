
"use client";

import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error);
        return;
      }

      setMessage("Registration successful!");

      setName("");
      setEmail("");
      setPassword("");

    } catch (error) {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md bg-slate-900 p-8 rounded-xl space-y-5"
      >
        <h1 className="text-3xl font-bold text-center">
          Create Account
        </h1>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded bg-slate-800"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded bg-slate-800"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded bg-slate-800"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 p-3 rounded font-semibold"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        {message && (
          <p className="text-center text-sm">{message}</p>
        )}
      </form>
    </main>
  );
}
