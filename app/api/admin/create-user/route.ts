import { NextResponse,NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import {connectDB} from '@/lib/mongodb';
import User from '@/models/userModel';

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      leaveBalances: {
        CL: 10,
        SL: 10,
        PL: 10,
        maxCL: 10,
        maxSL: 10,
        maxPL: 10,
      },
    });

    await newUser.save();

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
