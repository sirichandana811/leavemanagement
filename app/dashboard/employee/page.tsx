'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';

export default function EmployeeDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [leaveBalances, setLeaveBalances] = useState<null | {
    CL: number;
    SL: number;
    PL: number;
    maxCL: number;
    maxSL: number;
    maxPL: number;
  }>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    if (session?.user?.email) {
      fetch(`/api/admin/leave-balance?email=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setLeaveBalances(data.leaveBalances);
          }
        })
        .catch(() => console.error('Failed to fetch leave balances'));
    }
  }, [status, session, router]);

  const user = session?.user;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-700 mb-6">
          Welcome, {user?.name || 'Employee'}
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Leave Balances */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-purple-300">
            <h2 className="text-xl font-semibold mb-4 text-purple-600">Leave Balances</h2>
            {leaveBalances ? (
              <ul className="space-y-2 text-gray-700">
                <li>
                  Casual Leave (CL): {leaveBalances.CL} / {leaveBalances.maxCL}
                </li>
                <li>
                  Sick Leave (SL): {leaveBalances.SL} / {leaveBalances.maxSL}
                </li>
                <li>
                  Paid Leave (PL): {leaveBalances.PL} / {leaveBalances.maxPL}
                </li>
              </ul>
            ) : (
              <p className="text-gray-500">Loading balances...</p>
            )}
          </div>

          {/* Apply for Leave */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-purple-300 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-purple-600">Apply for Leave</h2>
              <p className="text-gray-600 mb-4">Submit your leave request with ease.</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/employee/apply')}
              className="bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
            >
              Apply Now
            </button>
          </div>

          {/* View Leave History */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-purple-300 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-purple-600">Leave History</h2>
              <p className="text-gray-600 mb-4">Track your leave requests and statuses.</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/employee/history')}
              className="bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
            >
              View History
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => signOut()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
