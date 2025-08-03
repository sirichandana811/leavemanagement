// File: app/api/employer/emp-leaves/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // ✅ make sure this is the correct path
import {connectDB} from '@/lib/mongodb';
import Leave from '@/models/leaveModel';
import { Session } from 'next-auth'; // ✅ Import type
import User from '@/models/userModel';
export async function GET(req: NextRequest) {
  await connectDB();

  const session: Session | null = await getServerSession({ req, ...authOptions });

  if (!session || !session.user?.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const leaves = await Leave.find({ toEmail: session.user.email }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, leaves });
  } catch (error) {
    console.error('Employer leaves fetch error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}


export async function PUT(req: NextRequest) {
  await connectDB();
  try {
    const { id, newStatus } = await req.json();
    const leave = await Leave.findById(id);
    if (!leave) {
      return NextResponse.json({ success: false, message: 'Leave not found' }, { status: 404 });
    }

    if (leave.status !== 'Pending') {
      return NextResponse.json({ success: false, message: 'Leave already processed' }, { status: 400 });
    }

    // If Approved, calculate days and deduct from balance
    if (newStatus === 'Approved') {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const user = await User.findOne({ email: leave.userEmail });
      if (!user) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
      }

      // Check if enough balance exists
      if (user.leaveBalances[leave.leaveType] < days) {
        return NextResponse.json({
          success: false,
          message: `Not enough ${leave.leaveType} balance`,
        }, { status: 400 });
      }

      // Deduct leave balance
      user.leaveBalances[leave.leaveType] -= days;
      await user.save();
    }

    // Update leave status
    leave.status = newStatus;
    await leave.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating leave status:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
