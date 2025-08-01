import { NextResponse } from "next/server";
import {connectDB} from "@/lib/mongodb";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import { signToken } from "@/utils/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  await connectDB();

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signToken(user);
  const res = NextResponse.json({ success: true });
  res.cookies.set("token", token);
  return res;
}
