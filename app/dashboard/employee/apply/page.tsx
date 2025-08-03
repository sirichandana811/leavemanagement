'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const ApplyPage = () => {
  const { data: session, status } = useSession();

  const [form, setForm] = useState({
    userEmail: '',
    toEmail: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const [message, setMessage] = useState('');
  const [leaveBalances, setLeaveBalances] = useState<{ CL: number; PL: number; SL: number } | null>(null);
  const [employers, setEmployers] = useState<string[]>([]); // Employer emails list

  useEffect(() => {
    if (session?.user?.email) {
      setForm((prev) => ({
        ...prev,
        userEmail: session.user.email!,
      }));

      // Fetch leave balances
      fetch(`/api/leaves/balance?email=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setLeaveBalances(data.balances);
        })
        .catch(() => setMessage('❌ Failed to load leave balances.'));

      // Fetch employers list
      fetch('/api/apply-employers')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.employers.length > 0) {
            setEmployers(data.employers);
            setForm((prev) => ({
              ...prev,
              toEmail: data.employers[0], // default to first employer
            }));
          }
        })
        .catch(() => setMessage('❌ Failed to load employer list.'));
    }
  }, [session]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calculateLeaveDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffInMs = endDate.getTime() - startDate.getTime();
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const today = new Date().toISOString().split('T')[0];
    if (form.startDate < today) {
      setMessage('❌ Start date cannot be in the past.');
      return;
    }

    if (form.endDate < form.startDate) {
      setMessage('❌ End date must be after or equal to start date.');
      return;
    }

    const leaveDays = calculateLeaveDays(form.startDate, form.endDate);

    if (
      leaveBalances &&
      form.leaveType &&
      leaveBalances[form.leaveType as 'CL' | 'SL' | 'PL'] < leaveDays
    ) {
      setMessage(`❌ You only have ${leaveBalances[form.leaveType as 'CL' | 'SL' | 'PL']} ${form.leaveType} days left but you're applying for ${leaveDays} day(s).`);
      return;
    }

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
          toEmail: employers[0] || '',
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

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-black">Apply for Leave</h1>

      {leaveBalances ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employer Select */}
          <select
            name="toEmail"
            className="w-full p-2 border rounded text-black"
            value={form.toEmail}
            onChange={handleChange}
            required
          >
            {employers.map((email) => (
              <option key={email} value={email}>
                {email}
              </option>
            ))}
          </select>

          {/* Leave Type */}
          <select
            name="leaveType"
            className="w-full p-2 border rounded text-black"
            value={form.leaveType}
            onChange={handleChange}
            required
          >
            <option value="">Select Leave Type</option>
            <option value="CL" disabled={leaveBalances.CL === 0}>
              Casual Leave (CL) - {leaveBalances.CL} left
            </option>
            <option value="SL" disabled={leaveBalances.SL === 0}>
              Sick Leave (SL) - {leaveBalances.SL} left
            </option>
            <option value="PL" disabled={leaveBalances.PL === 0}>
              Paid Leave (PL) - {leaveBalances.PL} left
            </option>
          </select>

          {/* Dates */}
          <input
            type="date"
            name="startDate"
            className="w-full p-2 border rounded text-black"
            value={form.startDate}
            onChange={handleChange}
            required
            min={today}
          />

          <input
            type="date"
            name="endDate"
            className="w-full p-2 border rounded text-black"
            value={form.endDate}
            onChange={handleChange}
            required
            min={form.startDate || today}
          />

          {/* Reason */}
          <textarea
            name="reason"
            placeholder="Reason for leave"
            className="w-full p-2 border rounded text-black"
            value={form.reason}
            onChange={handleChange}
            required
          />

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-purple-700 text-white p-2 rounded hover:bg-purple-800"
          >
            Submit Leave
          </button>

          {message && <p className="text-center mt-4 text-red-600">{message}</p>}
        </form>
      ) : (
        <p className="text-center text-gray-500">Loading leave balances...</p>
      )}
    </div>
  );
};

export default ApplyPage;
