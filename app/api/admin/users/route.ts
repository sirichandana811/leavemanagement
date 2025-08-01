import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import User from '@/models/userModel';
import { connectDB } from '@/lib/mongodb';
import Leave from '@/models/leaveModel';

// Admin route to fetch all users

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  await connectDB();

  try {
    const users = await User.find().select('+password');
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
