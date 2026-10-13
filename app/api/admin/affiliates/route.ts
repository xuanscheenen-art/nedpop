import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";

const normalizeCode = (value: unknown) =>
  typeof value === "string" ? value.trim().toUpperCase() : "";

export async function GET(request: NextRequest) {
  const access = await requireAdmin(request);
  if ("response" in access) return access.response;

  const [{ data: codes, error: codesError }, { data: orders, error: ordersError }] = await Promise.all([
    access.supabase.from("affiliate_codes").select("id, code, affiliate_name, is_active, created_at").order("created_at", { ascending: false }),
    access.supabase.from("affiliate_orders").select("*").order("created_at", { ascending: false }).limit(1000),
  ]);

  if (codesError || ordersError) {
    return NextResponse.json({ error: "Could not load affiliate data. Apply the affiliate SQL migration first." }, { status: 500 });
  }

  const userIds = [...new Set((orders ?? []).map((order) => order.user_id))];
  const { data: users, error: usersError } = userIds.length
    ? await access.supabase.from("users").select("id, email").in("id", userIds)
    : { data: [], error: null };

  if (usersError) return NextResponse.json({ error: "Could not load referred customer details." }, { status: 500 });
  const userEmails = new Map((users ?? []).map((user) => [user.id, user.email]));

  return NextResponse.json({
    codes: codes ?? [],
    orders: (orders ?? []).map((order) => ({ ...order, user_email: userEmails.get(order.user_id) ?? null })),
  });
}

export async function POST(request: NextRequest) {
  const access = await requireAdmin(request);
  if ("response" in access) return access.response;
  const body = await request.json().catch(() => null) as { code?: unknown; affiliateName?: unknown } | null;
  const code = normalizeCode(body?.code);
  const affiliateName = typeof body?.affiliateName === "string" ? body.affiliateName.trim() : "";

  if (!/^[A-Z0-9_-]{3,32}$/.test(code) || !affiliateName || affiliateName.length > 120) {
    return NextResponse.json({ error: "Code must be 3–32 letters/numbers/dashes/underscores, and affiliate name is required." }, { status: 400 });
  }

  const { data, error } = await access.supabase
    .from("affiliate_codes")
    .insert({ code, affiliate_name: affiliateName })
    .select("id, code, affiliate_name, is_active, created_at")
    .single();

  if (error?.code === "23505") return NextResponse.json({ error: "This code already exists." }, { status: 409 });
  if (error || !data) return NextResponse.json({ error: "Could not create affiliate code." }, { status: 500 });
  return NextResponse.json({ code: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const access = await requireAdmin(request);
  if ("response" in access) return access.response;
  const body = await request.json().catch(() => null) as {
    id?: unknown;
    code?: unknown;
    affiliateName?: unknown;
    isActive?: unknown;
  } | null;
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Code id is required." }, { status: 400 });

  const update: { code?: string; affiliate_name?: string; is_active?: boolean } = {};
  if (body?.code !== undefined) {
    const code = normalizeCode(body.code);
    if (!/^[A-Z0-9_-]{3,32}$/.test(code)) return NextResponse.json({ error: "Invalid code format." }, { status: 400 });
    update.code = code;
  }
  if (body?.affiliateName !== undefined) {
    const name = typeof body.affiliateName === "string" ? body.affiliateName.trim() : "";
    if (!name || name.length > 120) return NextResponse.json({ error: "Invalid affiliate name." }, { status: 400 });
    update.affiliate_name = name;
  }
  if (typeof body?.isActive === "boolean") update.is_active = body.isActive;
  if (!Object.keys(update).length) return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  const { data, error } = await access.supabase
    .from("affiliate_codes")
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, code, affiliate_name, is_active, created_at")
    .maybeSingle();

  if (error?.code === "23505") return NextResponse.json({ error: "This code already exists." }, { status: 409 });
  if (error) return NextResponse.json({ error: "Could not update affiliate code." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Affiliate code not found." }, { status: 404 });
  return NextResponse.json({ code: data });
}
