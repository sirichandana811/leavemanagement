import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Leave from '@/models/leaveModel';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { userEmail, toEmail, leaveType, startDate, endDate, reason } = body;

    if (!userEmail || !toEmail || !leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    const newLeave = new Leave({
      userEmail,
      toEmail,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'Pending',
    });

    await newLeave.save();

    return NextResponse.json({ success: true, message: 'Leave applied successfully' });
  } catch (error: any) {
    console.error('Error applying for leave:', error);
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 });
  }
}
