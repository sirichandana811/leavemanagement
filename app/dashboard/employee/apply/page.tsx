'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const ApplyPage = () => {
  const { data: session, status } = useSession();
  const [form, setForm] = useState({
    userEmail: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (session?.user?.email) {
      setForm((prev) => ({ ...prev, userEmail: session.user.email! }));
    }
  }, [session]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/leaves/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        setMessage('✅ Leave applied successfully!');
        setForm({
          userEmail: session?.user?.email || '',
          leaveType: '',
          startDate: '',
          endDate: '',
          reason: '',
        });
      } else {
        setMessage(data.message || '❌ Something went wrong');
      }
    } catch (error) {
      console.error('Client Error:', error);
      setMessage('❌ Server error. Please try again.');
    }
  };

  if (status === 'loading') return <p className="text-center mt-10">Loading session...</p>;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Apply for Leave</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Don't show user email input field anymore */}
        <select
          name="leaveType"
          className="w-full p-2 border rounded"
          value={form.leaveType}
          onChange={handleChange}
          required
        >
          <option value="">Select Leave Type</option>
          <option value="CL">Casual Leave (CL)</option>
          <option value="SL">Sick Leave (SL)</option>
          <option value="PL">Paid Leave (PL)</option>
        </select>

        <input
          type="date"
          name="startDate"
          className="w-full p-2 border rounded"
          value={form.startDate}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="endDate"
          className="w-full p-2 border rounded"
          value={form.endDate}
          onChange={handleChange}
          required
        />

        <textarea
          name="reason"
          placeholder="Reason for leave"
          className="w-full p-2 border rounded"
          value={form.reason}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="w-full bg-purple-700 text-white p-2 rounded hover:bg-purple-800"
        >
          Submit Leave
        </button>

        {message && <p className="text-center mt-4 text-red-600">{message}</p>}
      </form>
    </div>
  );
};

export default ApplyPage;
