import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function requireAdmin(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return { response: NextResponse.json({ error: "Authentication unavailable." }, { status: 503 }) } as const;
  }

  const auth = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: () => undefined,
    },
  });
  const { data, error } = await auth.auth.getUser();
  if (error || !data.user) {
    return { response: NextResponse.json({ error: "Please sign in." }, { status: 401 }) } as const;
  }

  const supabase = getSupabaseAdminClient();
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    return { response: NextResponse.json({ error: "Could not verify administrator access." }, { status: 500 }) } as const;
  }
  if (!profile?.is_admin) {
    return { response: NextResponse.json({ error: "Administrator access required." }, { status: 403 }) } as const;
  }

  return { user: data.user, supabase } as const;
}
