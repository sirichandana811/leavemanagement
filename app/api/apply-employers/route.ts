import { NextResponse } from 'next/server';
import {connectDB} from '@/lib/mongodb';
import User from '@/models/userModel';

export async function GET() {
  try {
    await connectDB();
    const employers = await User.find({ role: 'employer' }).select('email');
    const emails = employers.map((emp) => emp.email);
    return NextResponse.json({ success: true, employers: emails });
  } catch (error) {
    console.error('Error fetching employers:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch employers' });
  }
}
