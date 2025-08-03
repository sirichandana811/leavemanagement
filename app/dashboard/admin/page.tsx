'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
type User = {
  _id: string;
  name: string;
  email: string;
  role: 'employee' | 'employer' | 'admin';
  password: string;
  leaveBalances: {
    CL: number;
    SL: number;
    PL: number;
    maxCL: number;
    maxSL: number;
    maxPL: number;
  };
};

const roles = ['employee', 'employer', 'admin'];
type EditableField = 'name' | 'role' | 'CL' | 'SL' | 'PL' | 'maxCL' | 'maxSL' | 'maxPL';

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredRole, setFilteredRole] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        const text = await res.text();
        console.error('Failed to fetch users:', text);
        return;
      }

      const data = await res.json();
      if (data?.users) {
        setUsers(data.users);
      } else {
        console.error('No users returned:', data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);


  const handleInputChange = (
    id: string,
    field: EditableField,
    value: string | number
  ) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user._id === id) {
          if (field === 'name') {
            return { ...user, name: value as string };
          }
          if (field === 'role') {
            return {
              ...user,
              role: value as 'employee' | 'employer' | 'admin',
            };
          } else {
            return {
              ...user,
              leaveBalances: {
                ...user.leaveBalances,
                [field]: Number(value),
              },
            };
          }
        }
        return user;
      })
    );
  };

  const updateUser = async (user: User) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('Server error:', text);
        throw new Error('Failed to update user');
      }

      const data = await res.json();
      if (data.success) {
        alert('User updated');
        setEditingUserId(null);
        fetchUsers(); // Refresh full user list
      } else {
        alert(data.message || 'Update failed');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      alert('An error occurred while updating the user.');
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Invalid JSON response:', text);
        alert('Unexpected server response.');
        return;
      }

      if (data.success) {
        alert('User deleted');
        setUsers((prev) => prev.filter((u) => u._id !== id));
      } else {
        alert('Failed to delete user: ' + data.message);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred.');
    }
  };

  const resetPassword = async (id: string) => {
    const newPass = prompt('Enter new password');
    if (newPass) {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, newPassword: newPass }),
      });
      const data = await res.json();
      if (data.success) alert('Password updated');
      else alert(data.message || 'Failed to reset password');
    }
  };

  const createUser = async () => {
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    const data = await res.json();
    if (data.success) {
      alert('User created');
      fetchUsers(); // Refresh list after creation
      setNewUser({ name: '', email: '', password: '', role: 'employee' });
    } else {
      console.log('user creation failed:', data.message);
      alert(data.message);
    }
  };

  const filteredUsers = users
    .filter((u) => filteredRole === 'all' || u.role === filteredRole)
    .filter(
      (u) =>
        (u.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (u.email?.toLowerCase() || '').includes(search.toLowerCase())
    );

  const nonAdminUsers = filteredUsers.filter((u) => u.role !== 'admin');
  const adminUsers = filteredUsers.filter((u) => u.role === 'admin');

  return (
    <div className="p-6 max-w-screen-xl mx-auto text-sm text-black">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>

      {/* Filter & Search */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 text-white">
        <div>
          <label className="mr-2 font-medium">Filter by Role:</label>
          <select
            value={filteredRole}
            onChange={(e) => setFilteredRole(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="all">All</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-1 rounded w-60"
        />
        <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
    >
      Logout
    </button>
      </div>

      {/* Create New User */}
      <div className="bg-white p-6 mb-8 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Create New User</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            className="border p-2 rounded"
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
          />
          <select
            className="border p-2 rounded"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            {roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={createUser}
          >
            Create
          </button>
        </div>
      </div>

      {/* Users Table (Non-Admins) */}
      <div className="overflow-x-auto mb-12">
        <h2 className="text-xl font-semibold mb-2">Employees & Employers</h2>
        <table className="w-full bg-white rounded shadow text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">CL</th>
              <th className="p-2">SL</th>
              <th className="p-2">PL</th>
              <th className="p-2">maxCL</th>
              <th className="p-2">maxSL</th>
              <th className="p-2">maxPL</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {nonAdminUsers.map((u) => (
              <tr key={u._id} className="text-center border-t hover:bg-gray-50">
                <td className="p-2">
                  {editingUserId === u._id ? (
                    <input
                      className="border p-1 rounded text-center"
                      value={u.name}
                      onChange={(e) =>
                        handleInputChange(u._id, 'name', e.target.value)
                      }
                    />
                  ) : (
                    u.name
                  )}
                </td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  {editingUserId === u._id ? (
                    <select
                      value={u.role}
                      onChange={(e) =>
                        handleInputChange(u._id, 'role', e.target.value)
                      }
                      className="border p-1 rounded"
                    >
                      {roles.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  ) : (
                    u.role
                  )}
                </td>
                {['CL', 'SL', 'PL', 'maxCL', 'maxSL', 'maxPL'].map((field) => (
                  <td key={field} className="p-2">
                    {editingUserId === u._id ? (
                      <input
                        type="number"
                        value={(u.leaveBalances as any)[field]}
                        onChange={(e) =>
                          handleInputChange(
                            u._id,
                            field as EditableField,
                            e.target.value
                          )
                        }
                        className="border w-16 p-1 rounded text-center"
                      />
                    ) : (
                      (u.leaveBalances as any)[field]
                    )}
                  </td>
                ))}
                <td className="p-2 flex flex-col gap-1">
                  {editingUserId === u._id ? (
                    <button
                      onClick={() => updateUser(u)}
                      className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingUserId(u._id)}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => resetPassword(u._id)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  >
                    Reset Pass
                  </button>
                  <button
                    onClick={() => deleteUser(u._id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Admins Table */}
      <div className="overflow-x-auto">
        <h2 className="text-xl font-semibold mb-2">Admins</h2>
        <table className="w-full bg-white rounded shadow text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((u) => (
              <tr key={u._id} className="text-center border-t hover:bg-gray-50">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2 flex flex-col gap-1">
                  <button
                    onClick={() => resetPassword(u._id)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={() => deleteUser(u._id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
