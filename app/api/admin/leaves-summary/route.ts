// app/api/leave/summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Policy from "@/models/policyModel";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const policy = await Policy.findOne().sort({ createdAt: -1 }); // get the latest policy

    if (!policy) {
      return NextResponse.json(
        { error: "Policy not found" },
        { status: 404 }
      );
    }

    const { CL = 0, SL = 0, PL = 0 } = policy;

    return NextResponse.json({ CL, SL, PL });
  } catch (error) {
    console.error("Error fetching leave summary:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
