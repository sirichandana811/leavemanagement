import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Policy from "@/models/policyModel";

// GET - fetch policy by email
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const email = req.nextUrl.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const policy = await Policy.findOne({ email });

    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    return NextResponse.json(policy);
  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// PUT - create or update policy
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const { email, maxCL, maxSL, maxPL } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const updatedPolicy = await Policy.findOneAndUpdate(
      { email },
      {
        $set: {
          maxCL,
          maxSL,
          maxPL,
          currentCL: maxCL,
          currentSL: maxSL,
          currentPL: maxPL,
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(updatedPolicy);
  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
