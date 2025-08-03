'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

type Leave = {
  _id: string;
  userEmail: string;
  leaveType: 'CL' | 'SL' | 'PL';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
};

export default function EmployerDashboard() {
  const { data: session, status } = useSession();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/employer/emp-leaves')
        .then((res) => res.json())
        .then((data) => setLeaves(data.leaves))
        .catch(console.error);
    }
  }, [status]);

  const updateStatus = async (id: string, newStatus: 'Approved' | 'Rejected') => {
    const res = await fetch('/api/employer/emp-leaves', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, newStatus }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage(`Leave ${newStatus}`);
      setLeaves((prev) =>
        prev.map((l) => (l._id === id ? { ...l, status: newStatus } : l))
      );
    } else {
      setMessage(data.message);
    }
  };

  if (status === 'loading') return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <h1 className="text-3xl font-bold mb-4">Employer Dashboard</h1>
      {message && <p className="mb-2 text-center text-green-600">{message}</p>}
      <table className="w-full bg-white rounded shadow">
        <thead className="bg-purple-700 text-white">
          <tr>
            <th>Email</th>
            <th>Type</th>
            <th>From</th>
            <th>To</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((l) => (
            <tr key={l._id} className="text-center border-t">
              <td>{l.userEmail}</td>
              <td>{l.leaveType}</td>
              <td>{l.startDate}</td>
              <td>{l.endDate}</td>
              <td>{l.reason}</td>
              <td>{l.status}</td>
              <td>
                {l.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(l._id, 'Approved')}
                      className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(l._id, 'Rejected')}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
}
