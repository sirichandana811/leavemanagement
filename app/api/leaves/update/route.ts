import { connectDB } from '@/lib/mongodb';
import Leave from '@/models/leaveModel';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const { id, status } = await req.json();

    const updated = await Leave.findByIdAndUpdate(id, { status }, { new: true });

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Leave not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Status updated', leave: updated });
  } catch (error) {
    console.error('Error updating leave status:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
