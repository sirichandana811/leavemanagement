import { connectDB } from "@/lib/mongodb";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password, role } = await req.json();
  await connectDB();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ email, password: hashedPassword, role });

  return NextResponse.json({ success: true });
}
