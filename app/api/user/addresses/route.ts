import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { requireUser } from "@/lib/session";

// GET /api/user/addresses — list current user's addresses
export async function GET() {
  const sessionUser = await requireUser();
  if (!sessionUser)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const user = await User.findById(sessionUser.id).select("addresses").lean();
  return NextResponse.json((user as any)?.addresses ?? []);
}

// POST /api/user/addresses — add a new address
export async function POST(req: NextRequest) {
  const sessionUser = await requireUser();
  if (!sessionUser)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();

  const required = ["fullName", "phone", "line1", "city", "state", "pincode"];
  for (const f of required) {
    if (!body[f] || String(body[f]).trim() === "") {
      return NextResponse.json({ error: `${f} is required` }, { status: 400 });
    }
  }

  const user = await User.findById(sessionUser.id);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const makeDefault = user.addresses.length === 0 || !!body.isDefault;
  if (makeDefault) {
    user.addresses.forEach((a: any) => (a.isDefault = false));
  }

  user.addresses.push({
    label: body.label || "Home",
    fullName: body.fullName,
    phone: body.phone,
    line1: body.line1,
    line2: body.line2 || "",
    city: body.city,
    state: body.state,
    pincode: body.pincode,
    lat: body.lat,
    lng: body.lng,
    isDefault: makeDefault,
  });

  await user.save();
  return NextResponse.json(user.addresses, { status: 201 });
}
