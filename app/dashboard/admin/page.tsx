'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type User = {
  _id: string;
  email: string;
  name: string;
  role: string;
};

type LeaveSummary = {
  CL: number;
  SL: number;
  PL: number;
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [leaveSummary, setLeaveSummary] = useState<{ [email: string]: LeaveSummary }>({});
  const [resettingEmail, setResettingEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'employee' });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'admin') {
      alert('Access Denied. Admins only.');
      router.push('/login');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user.role === 'admin') {
      fetchUsers();
      fetchLeaveData();
    }
  }, [session]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchLeaveData = async () => {
    try {
      const res = await fetch('/api/admin/leaves-summary');
      const data = await res.json();
      setLeaveSummary(data);
    } catch (err) {
      console.error('Error fetching leave summary:', err);
    }
  };

  const promoteToAdmin = async (email: string) => {
    await fetch('/api/admin/promote-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    fetchUsers();
  };


  const handleLogout = () => {
    localStorage.clear(); // Clear role, email, etc.
    router.push('/login'); // Redirect to login
  };
  const handleDelete = async (email: string) => {
    if (!window.confirm(`Are you sure you want to delete ${email}?`)) return;

    const res = await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) return alert(`Failed to delete: ${data.error}`);

    setUsers((prev) => prev.filter((user) => user.email !== email));
    alert('User deleted');
  };

  const submitPasswordReset = async (email: string) => {
    if (!newPassword) return alert('Password cannot be empty');

    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword }),
    });

    const data = await res.json();
    alert(data.message);
    setResettingEmail(null);
    setNewPassword('');
  };

  const handleCreateUser = async () => {
    const { name, email, password, role } = newUser;
    if (!name || !email || !password) {
      alert('Please fill all fields');
      return;
    }

    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || 'Failed to create user');

    alert('User created successfully');
    setShowCreateForm(false);
    setNewUser({ name: '', email: '', password: '', role: 'employee' });
    fetchUsers();
  };

  const exportPDF = async () => {
    const res = await fetch('/api/admin/export/pdf');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leave-report.pdf';
    a.click();
    a.remove();
  };

  const exportExcel = async () => {
    const res = await fetch('/api/admin/export/excel');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leave-report.xlsx';
    a.click();
    a.remove();
  };

  if (status === 'loading') return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">Admin Dashboard</h1>
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          onClick={() => setShowCreateForm(true)}
        >
          + Create New User
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3 text-black">User Management</h2>
        <table className="min-w-full text-sm text-left text-black">
          <thead>
            <tr>
              <th className="py-2 px-3">Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>CL</th>
              <th>SL</th>
              <th>PL</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const summary = leaveSummary[user.email] || { CL: 0, SL: 0, PL: 0 };
              return (
                <tr key={user._id} className="border-t">
                  <td className="py-2 px-3">{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{summary.CL}</td>
                  <td>{summary.SL}</td>
                  <td>{summary.PL}</td>
                  <td className="space-y-1">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => promoteToAdmin(user.email)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm block"
                      >
                        Promote to Admin
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(user.email)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm block"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() =>
                        resettingEmail === user.email
                          ? setResettingEmail(null)
                          : setResettingEmail(user.email)
                      }
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm block"
                    >
                      {resettingEmail === user.email ? 'Cancel' : 'Reset Password'}
                    </button>
                    {resettingEmail === user.email && (
                      <div className="mt-2 space-y-1">
                        <input
                          type="password"
                          placeholder="New Password"
                          className="w-full p-2 border rounded"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                          onClick={() => submitPasswordReset(user.email)}
                          className="bg-green-600 text-white px-3 py-1 rounded w-full"
                        >
                          Submit
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
<button
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 absolute top-4 right-4"
    >
      Logout
    </button>
      {/* Reports & Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-black">Leave Policy Settings</h2>
          <p className="text-black">Manage leave types, balances, and rules.</p>
          <button
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => router.push('/dashboard/admin/policies')}
          >
            Configure Policies
          </button>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-black">Reports & Export</h2>
          <div className="space-x-2 mt-4">
            <button onClick={exportPDF} className="bg-purple-600 text-white px-4 py-2 rounded">
              Export PDF
            </button>
            <button onClick={exportExcel} className="bg-yellow-500 text-white px-4 py-2 rounded">
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 space-y-3">
            <h3 className="text-xl font-bold text-black">Create New User</h3>

            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-2 border rounded"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 border rounded"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 border rounded"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
            <select
              className="w-full p-2 border rounded"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleCreateUser}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
    
  );
}
