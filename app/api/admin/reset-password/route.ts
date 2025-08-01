import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/userModel';

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    await connectDB();

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
