import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";

// POST /api/auth/register — create an account with email + password
export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  const name = (body.name || "").trim();
  const email = (body.email || "").toLowerCase().trim();
  const password = body.password || "";

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email and password are required" },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const existing = await User.findOne({ email }).select("+password");
  if (existing) {
    if (existing.password) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }
    // Account created via Google before — attach a password to it.
    existing.password = await bcrypt.hash(password, 10);
    if (name && !existing.name) existing.name = name;
    await existing.save();
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const isAdminEmail =
    process.env.ADMIN_EMAIL &&
    email === process.env.ADMIN_EMAIL.toLowerCase();

  const hash = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email,
    password: hash,
    role: isAdminEmail ? "admin" : "customer",
    isActive: true,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
