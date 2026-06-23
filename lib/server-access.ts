import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  decideModuleAccess,
  isCourseLevel,
  isTargetModule,
  normalizeUnlockedLevels,
  type AccessDecision,
  type TargetModule,
  type UnlockableLevel,
} from "@/lib/access-control";
import type { CourseLevel } from "@/types/course";

export type AuthenticatedAccessContext = {
  userId: string;
  email: string | null;
  unlockedLevels: UnlockableLevel[];
};

export type AccessCheckResult =
  | {
      ok: true;
      context: AuthenticatedAccessContext | null;
      decision: AccessDecision;
    }
  | {
      ok: false;
      response: NextResponse;
      decision?: AccessDecision;
    };

export function targetAccessFromRequest(request: NextRequest): {
  targetModule: TargetModule | null;
  targetLevel: CourseLevel;
} {
  const params = request.nextUrl.searchParams;
  const targetModule = params.get("targetModule") ?? params.get("module");
  const targetLevel = params.get("targetLevel") ?? params.get("level");

  return {
    targetModule: isTargetModule(targetModule) ? targetModule : null,
    targetLevel: isCourseLevel(targetLevel) ? targetLevel : "A0",
  };
}

export async function getRequestAccessContext(request: NextRequest): Promise<AuthenticatedAccessContext | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  const response = NextResponse.next();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;

  const { data: userRow } = await supabase
    .from("users")
    .select("unlocked_levels")
    .eq("id", userData.user.id)
    .maybeSingle();

  return {
    userId: userData.user.id,
    email: userData.user.email ?? null,
    unlockedLevels: normalizeUnlockedLevels(userRow?.unlocked_levels),
  };
}

function unauthorizedResponse(reason: string, status: 401 | 403, requiredLevel?: UnlockableLevel) {
  return NextResponse.json(
    {
      error: reason,
      requiredLevel,
    },
    { status },
  );
}

export async function checkModuleAccess(params: {
  request: NextRequest;
  targetModule: TargetModule;
  targetLevel?: CourseLevel;
}): Promise<AccessCheckResult> {
  const context = await getRequestAccessContext(params.request);
  const decision = decideModuleAccess({
    targetModule: params.targetModule,
    targetLevel: params.targetLevel,
    subject: {
      signedIn: Boolean(context),
      unlockedLevels: context?.unlockedLevels ?? [],
    },
  });

  if (decision.allowed) {
    return { ok: true, context, decision };
  }

  if (decision.reason === "login-required") {
    return {
      ok: false,
      decision,
      response: unauthorizedResponse("LOGIN_REQUIRED", 401, decision.requiredLevel),
    };
  }

  return {
    ok: false,
    decision,
    response: unauthorizedResponse("ENTITLEMENT_REQUIRED", 403, decision.requiredLevel),
  };
}

export function withModuleAccess(
  targetModule: TargetModule,
  getTargetLevel: (request: NextRequest) => CourseLevel = (request) => targetAccessFromRequest(request).targetLevel,
) {
  return function wrapHandler<T extends unknown[]>(
    handler: (request: NextRequest, context: AuthenticatedAccessContext | null, ...args: T) => Promise<Response> | Response,
  ) {
    return async (request: NextRequest, ...args: T) => {
      const access = await checkModuleAccess({
        request,
        targetModule,
        targetLevel: getTargetLevel(request),
      });

      if (!access.ok) return access.response;
      return handler(request, access.context, ...args);
    };
  };
}
