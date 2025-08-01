import { connectDB } from '@/lib/mongodb';
import  User  from '@/models/userModel';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password, role } = body;

  await connectDB();

  const exists = await User.findOne({ email });
  if (exists) return NextResponse.json({ message: 'User already exists' }, { status: 400 });

  // ✅ Allow only employee or employer roles to be created via signup
  if (role !== 'employee' && role !== 'employer') {
    return NextResponse.json({ message: 'Invalid role selection' }, { status: 403 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword, role });
  await user.save();

  return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
}
