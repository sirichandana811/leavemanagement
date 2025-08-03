// app/api/admin/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/mongodb';
import User from '@/models/userModel';

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const { _id, name, email, role, leaveBalances } = body;

    if (!_id) {
      return NextResponse.json({ success: false, message: 'Missing user ID' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { name, email, role, leaveBalances },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: any) {
    console.error('API error:', err.message);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
export async function GET() {
  try {
    await connectDB();
    const users = await User.find({});
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ users: [] }, { status: 500 });
  }
}