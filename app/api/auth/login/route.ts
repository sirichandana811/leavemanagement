import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb"; // Use your actual path
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "yourSecretKey";

export async function POST(req: Request) {
  try {
    const { email, password ,role} = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });

    if (!user || user.role.toLowerCase() !== role.toLowerCase()) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create JWT with user role and email
    const token = jwt.sign(
      { email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({ success: true, role: user.role });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
