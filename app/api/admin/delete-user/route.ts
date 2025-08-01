import { connectDB } from "@/lib/mongodb";
import User from "@/models/userModel"; // Ensure this path is correct
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    await connectDB();

    const deletedUser = await User.findOneAndDelete({ email });

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
