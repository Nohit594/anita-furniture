import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { requireAdmin } from "@/lib/session";

// GET /api/users — admin lists all users
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  const users = await User.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(users);
}

// PATCH /api/users — admin updates a user's role or active status
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  const { userId, role, isActive } = await req.json();
  if (!userId)
    return NextResponse.json({ error: "userId required" }, { status: 400 });

  // Prevent an admin from demoting/deactivating themselves
  if (userId === admin.id) {
    return NextResponse.json(
      { error: "You cannot modify your own account" },
      { status: 400 }
    );
  }

  const update: Record<string, unknown> = {};
  if (role != null) update.role = role;
  if (isActive != null) update.isActive = isActive;

  const user = await User.findByIdAndUpdate(userId, update, { new: true }).lean();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}
