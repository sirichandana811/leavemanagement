// app/api/leaves/history/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Leave from '@/models/leaveModel';

export async function GET(request: Request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const leaves = await Leave.find({ userEmail: email }).sort({ createdAt: -1 });

    return NextResponse.json(leaves, { status: 200 });
  } catch (error) {
    console.error('History API Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
