import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AuthenticationError } from "@/lib/errors/AppError";
import { logger } from "@/lib/logging/logger";

export async function requireAuth(request: NextRequest): Promise<{
  user: { id: string; email?: string };
  supabase: Awaited<ReturnType<typeof createClient>>;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    logger.warn("Authentication failed", {
      path: request.nextUrl.pathname,
      error: error?.message,
    });
    throw new AuthenticationError("Authentication required");
  }

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    supabase,
  };
}

export function authMiddleware(
  handler: (
    request: NextRequest,
    context: { user: { id: string; email?: string }; supabase: Awaited<ReturnType<typeof createClient>> }
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const auth = await requireAuth(request);
      return await handler(request, auth);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
          },
          { status: 401 }
        );
      }
      throw error;
    }
  };
}
