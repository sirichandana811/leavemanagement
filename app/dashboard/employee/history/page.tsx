'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface LeaveRecord {
  leaveType: string;
  fromDate: string;
  toDate: string;
  status: string;
  reason: string;
}

export default function LeaveHistoryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [history, setHistory] = useState<LeaveRecord[]>([]);

 useEffect(() => {
  if (session?.user?.email) {
    fetch(`/api/leaves/history?email=${session.user.email}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => setHistory(data))
      .catch((err) => {
        console.error('Error fetching history:', err);
        setHistory([]); // Optionally clear
      });
  }
}, [session]);

  return (
    <div className="min-h-screen bg-purple-100 p-6">
      <h1 className="text-2xl font-bold text-purple-700 mb-6">Leave History</h1>

      <div className="bg-white rounded-lg shadow p-4">
        {history.length === 0 ? (
          <p className="text-center text-gray-500">No leave records found.</p>
        ) : (
          <table className="w-full text-sm text-left border">
            <thead className="bg-purple-200 text-purple-900">
              <tr>
                <th className="p-2 border">Type</th>
                <th className="p-2 border">From</th>
                <th className="p-2 border">To</th>
                <th className="p-2 border">Reason</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={index} className="hover:bg-purple-50">
                  <td className="p-2 border">{item.leaveType}</td>
                  <td className="p-2 border">{item.fromDate}</td>
                  <td className="p-2 border">{item.toDate}</td>
                  <td className="p-2 border">{item.reason}</td>
                  <td className="p-2 border text-green-700 font-semibold">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <button
        onClick={() => router.push('/dashboard/employee')}
        className="mt-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
