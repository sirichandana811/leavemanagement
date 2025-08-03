'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn('credentials', {
      email,
      password,
      role: 'admin', // Important for auth logic
      redirect: false,
    });

    if (!res || !res.ok) {
      alert('Invalid credentials or not an admin.');
      return;
    }

    const sessionRes = await fetch('/api/auth/session');
    const session = await sessionRes.json();

    if (session?.user?.role !== 'admin') {
      alert('Access denied. You are not an admin.');
      return;
    }

    router.push('/dashboard/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form
        onSubmit={handleAdminLogin}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-black">Admin Login</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full p-2 border rounded mb-4"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full p-2 border rounded mb-4"
        />
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
        >
          Login as Admin
        </button>
      </form>
    </div>
  );
}
