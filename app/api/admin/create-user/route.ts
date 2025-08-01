import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import {connectDB} from '../../../../lib/mongodb';
import User from '@/models/userModel';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // 🔒 Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('[CREATE_USER_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
