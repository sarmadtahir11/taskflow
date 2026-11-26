
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

interface FormData {
  name: string;
  email: string;
  password: string;
}

export default function SignupPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Registration failed");
        return;
      }

      setMessage("Registration successful!");
      reset();

    } catch (error) {
      console.error("Signup Error:", error);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-slate-900 p-8 rounded-xl space-y-5"
      >
        <h1 className="text-3xl font-bold text-center">
          Create Account
        </h1>

        <div>
          <input
            type="text"
            placeholder="Full Name"
            {...register("name", {
              required: "Name is required",
            })}
            className="w-full p-3 rounded bg-slate-800"
          />

          {errors.name && (
            <p className="text-sm text-red-400 mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <input
            type="email"
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email",
              },
            })}
            className="w-full p-3 rounded bg-slate-800"
          />

          {errors.email && (
            <p className="text-sm text-red-400 mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
            className="w-full p-3 rounded bg-slate-800"
          />

          {errors.password && (
            <p className="text-sm text-red-400 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 p-3 rounded font-semibold disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        {message && (
          <p className="text-center text-sm">
            {message}
          </p>
        )}
      </form>
    </main>
  );
}
