import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Lead } from "@/lib/models/Lead";
import { requireAdmin } from "@/lib/session";

// POST /api/leads — public: capture a registration lead from the first-visit popup
export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  const firstName = (body.firstName || "").trim();
  const email = (body.email || "").trim();
  const mobile = (body.mobile || "").trim();

  if (!firstName || !email || !mobile) {
    return NextResponse.json(
      { error: "First name, email and mobile are required" },
      { status: 400 }
    );
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const mobileOk = /^\d{10}$/.test(mobile.replace(/\D/g, ""));
  if (!emailOk) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!mobileOk) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit mobile number" },
      { status: 400 }
    );
  }

  const lead = await Lead.create({
    firstName,
    lastName: (body.lastName || "").trim(),
    email,
    mobile: mobile.replace(/\D/g, ""),
    city: (body.city || "").trim(),
    pincode: (body.pincode || "").trim(),
    interests: Array.isArray(body.interests) ? body.interests : [],
  });

  return NextResponse.json({ ok: true, id: lead._id }, { status: 201 });
}

// GET /api/leads — admin: list captured leads
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  const leads = await Lead.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json(leads);
}
