import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { requireUser } from "@/lib/session";

// PATCH /api/user/addresses/[id] — edit an address or set it as default
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionUser = await requireUser();
  if (!sessionUser)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const user = await User.findById(sessionUser.id);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const addr = user.addresses.id(params.id);
  if (!addr)
    return NextResponse.json({ error: "Address not found" }, { status: 404 });

  if (body.setDefault) {
    user.addresses.forEach((a: any) => (a.isDefault = false));
    addr.isDefault = true;
  }

  // Optional field updates
  const fields = [
    "label",
    "fullName",
    "phone",
    "line1",
    "line2",
    "city",
    "state",
    "pincode",
    "lat",
    "lng",
  ];
  for (const f of fields) {
    if (body[f] != null) (addr as any)[f] = body[f];
  }

  await user.save();
  return NextResponse.json(user.addresses);
}

// DELETE /api/user/addresses/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionUser = await requireUser();
  if (!sessionUser)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const user = await User.findById(sessionUser.id);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const addr = user.addresses.id(params.id);
  const wasDefault = addr?.isDefault;
  addr?.deleteOne();

  // Promote another address to default if we removed the default one
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  return NextResponse.json(user.addresses);
}
