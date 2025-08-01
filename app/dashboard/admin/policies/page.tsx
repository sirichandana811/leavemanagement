"use client";

import { useEffect, useState } from "react";

export default function PolicyPage() {
  const [email, setEmail] = useState("");
  const [maxCL, setMaxCL] = useState(0);
  const [maxSL, setMaxSL] = useState(0);
  const [maxPL, setMaxPL] = useState(0);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/admin/policies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, maxCL, maxSL, maxPL }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      setMessage("Policy updated successfully!");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Set Leave Policy</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {message && <p className="text-red-600">{message}</p>}

        <input
          type="email"
          placeholder="User Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Max CL"
          className="w-full p-2 border rounded"
          value={maxCL}
          onChange={(e) => setMaxCL(Number(e.target.value))}
        />

        <input
          type="number"
          placeholder="Max SL"
          className="w-full p-2 border rounded"
          value={maxSL}
          onChange={(e) => setMaxSL(Number(e.target.value))}
        />

        <input
          type="number"
          placeholder="Max PL"
          className="w-full p-2 border rounded"
          value={maxPL}
          onChange={(e) => setMaxPL(Number(e.target.value))}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save Policy
        </button>
      </form>
    </div>
  );
}
