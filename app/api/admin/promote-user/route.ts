import { NextResponse } from "next/server";
import {connectDB} from "@/lib/mongodb";
import User from "@/models/userModel";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { role: "admin" },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
