import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { requireUser } from "@/lib/session";

// PATCH /api/user/profile — update the signed-in user's name and/or avatar
export async function PATCH(req: NextRequest) {
  const sessionUser = await requireUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const body = await req.json();
  const update: Record<string, unknown> = {};

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (name.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }
    if (name.length > 60) {
      return NextResponse.json({ error: "Name is too long" }, { status: 400 });
    }
    update.name = name;
  }

  if (typeof body.image === "string" && body.image.trim()) {
    update.image = body.image.trim();
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const user = await User.findByIdAndUpdate(sessionUser.id, update, {
    new: true,
  }).lean();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    name: (user as any).name,
    image: (user as any).image,
  });
}
