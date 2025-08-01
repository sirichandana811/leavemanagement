// app/login/page.tsx

"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid credentials");
    } else {
      router.push("/dashboard"); // your protected page
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
        >
          Login
        </button>

        <button
          type="button"
          onClick={() => signIn("google")}
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
        >
          Sign in with Google
        </button>

        <p className="text-center text-sm">
          Don’t have an account?{" "}
          <a href="/signup" className="text-purple-600 font-medium underline">
            Sign up
          </a>
        </p>
        <p className="text-sm text-center">
  Are you an admin?{' '}
  <Link href="/admin-login" className="text-blue-600 font-semibold underline">
    Login here
  </Link>
</p>
      </form>
    </div>
  );
}
