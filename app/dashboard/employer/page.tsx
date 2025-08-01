'use client';
import { useEffect, useState } from 'react';

type Leave = {
  _id: string;
  userEmail: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
};

type LeaveBalance = {
  [key: string]: number; // e.g., { CL: 5, SL: 2 }
};

type UserBalanceMap = {
  [email: string]: LeaveBalance;
};

const EmployerDashboard = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [balances, setBalances] = useState<UserBalanceMap>({});
  const [message, setMessage] = useState('');

  // Fetch leave applications
  useEffect(() => {
    fetch('/api/leaves/all')
      .then((res) => res.json())
      .then((data) => setLeaves(data))
      .catch(() => setMessage('Failed to fetch leave records'));

    // Fetch user leave balances
    fetch('/api/users/balances')
      .then((res) => res.json())
      .then((data) => setBalances(data))
      .catch(() => setMessage('Failed to fetch user balances'));
  }, []);

  const updateStatus = async (id: string, newStatus: string, leave: Leave) => {
    if (newStatus === 'Approved') {
      const userBalance = balances[leave.userEmail];
      const currentBalance = userBalance?.[leave.leaveType] || 0;

      const daysRequested =
        (new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) /
        (1000 * 60 * 60 * 24) + 1;

      if (daysRequested > currentBalance) {
        setMessage(`Cannot approve. ${leave.userEmail} has insufficient ${leave.leaveType} balance.`);
        return;
      }
    }

    try {
      const res = await fetch(`/api/leaves/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        setLeaves((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
        );
        setMessage('Status updated successfully');
      } else {
        setMessage('Failed to update status');
      }
    } catch (error) {
      setMessage('Error updating status');
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6 text-center">Employer Dashboard</h1>
      {message && <p className="mb-4 text-center text-red-600">{message}</p>}

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-purple-700 text-white">
            <tr>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Type</th>
              <th className="p-3 border">From</th>
              <th className="p-3 border">To</th>
              <th className="p-3 border">Reason</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave._id} className="text-center border-t">
                <td className="p-2 border">{leave.userEmail}</td>
                <td className="p-2 border">{leave.leaveType}</td>
                <td className="p-2 border">{leave.startDate}</td>
                <td className="p-2 border">{leave.endDate}</td>
                <td className="p-2 border">{leave.reason}</td>
                <td
                  className={`p-2 border font-semibold ${
                    leave.status === 'Pending'
                      ? 'text-yellow-600'
                      : leave.status === 'Approved'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {leave.status}
                </td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => updateStatus(leave._id, 'Approved', leave)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(leave._id, 'Rejected', leave)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
            {leaves.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  No leave applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployerDashboard;
