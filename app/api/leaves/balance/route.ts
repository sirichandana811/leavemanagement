// app/api/leaves/balance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/mongodb';
import User from '@/models/userModel';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');

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
      balances: {
        CL: user.leaveBalances.CL,
        SL: user.leaveBalances.SL,
        PL: user.leaveBalances.PL,
      },
    });
  } catch (err) {
    console.error('Balance Fetch Error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
