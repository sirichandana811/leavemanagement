// app/page.tsx
export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100">
      <h1 className="text-4xl font-bold mb-4 text-black">Welcome to the Leave Management System</h1>
      <p className="text-lg text-gray-600 mb-6">Please login to continue.</p>
      <a
        href="/login"
        className="bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-800 transition"
      >
        Go to Login
      </a>
    </main>
  );
}
