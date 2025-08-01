'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleAdminLogin = async (e: any) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (!res?.ok) {
      alert('Invalid credentials');
      return;
    }

    // Fetch session to verify role
    const sessionRes = await fetch('/api/auth/session');
    const session = await sessionRes.json();
    if (session?.user?.role !== 'admin') {
      alert('Access Denied. Not an admin.');
      return;
    }

    router.push('/dashboard/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleAdminLogin} className="bg-white shadow-md p-8 rounded space-y-4 w-full max-w-md">
        <h2 className="text-xl font-semibold">Admin Login</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Admin Email"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded">Login as Admin</button>
      </form>
    </div>
  );
}
