'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    if (status === 'authenticated') {
      const role = session?.user?.role;

      if (role === 'admin') {
        router.push('/dashboard/admin');
      } else if (role === 'employee') {
        router.push('/dashboard/employee');
      } else if (role === 'employer') {
        router.push('/dashboard/employer');
      }
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-purple-700 mb-4">Redirecting to your dashboard...</h1>
        <p className="text-gray-600">Please wait while we load your role-specific dashboard.</p>
      </div>
    </div>
  );
}
