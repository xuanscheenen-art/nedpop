import { NextResponse, type NextRequest } from "next/server";
import { isTargetModule } from "@/lib/access-control";
import { checkModuleAccess, targetAccessFromRequest } from "@/lib/server-access";

export async function GET(request: NextRequest) {
  const { targetModule, targetLevel } = targetAccessFromRequest(request);

  if (!targetModule || !isTargetModule(targetModule)) {
    return NextResponse.json({ error: "INVALID_TARGET_MODULE" }, { status: 400 });
  }

  const access = await checkModuleAccess({
    request,
    targetModule,
    targetLevel,
  });

  if (!access.ok) {
    return access.response;
  }

  return NextResponse.json({
    allowed: true,
    reason: access.decision.reason,
    targetModule,
    targetLevel,
    userId: access.context?.userId ?? null,
    unlockedLevels: access.context?.unlockedLevels ?? [],
  });
}
