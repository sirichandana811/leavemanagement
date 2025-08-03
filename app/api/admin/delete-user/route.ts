// app/api/admin/delete-user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/mongodb'; // use your actual DB connection path
import User from '@/models/userModel';

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
    }

    await connectDB();

    await User.findByIdAndDelete(userId);

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
