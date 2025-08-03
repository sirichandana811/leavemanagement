import { NextResponse } from 'next/server';
import {connectDB} from '@/lib/mongodb';
import User from '@/models/userModel';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
  }

  try {
    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      leaveBalances: user.leaveBalances,
    });
  } catch (error) {
    console.error('[LEAVE BALANCE API ERROR]', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
