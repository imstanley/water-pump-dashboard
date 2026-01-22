import { NextRequest, NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "@/lib/errors/AppError";
import { logger } from "@/lib/logging/logger";

export function validateRequest<T>(
  schema: ZodSchema<T>,
  handler: (request: NextRequest, data: T, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      let data: unknown;

      // Parse request body based on method
      if (request.method === "GET") {
        const url = new URL(request.url);
        const params: Record<string, string> = {};
        url.searchParams.forEach((value, key) => {
          params[key] = value;
        });
        data = params;
      } else {
        try {
          data = await request.json();
        } catch {
          // If JSON parsing fails, try to get form data
          const formData = await request.formData();
          data = Object.fromEntries(formData.entries());
        }
      }

      // Validate with Zod schema
      const validatedData = schema.parse(data);

      return await handler(request, validatedData, context);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.issues.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        logger.warn("Validation error", {
          path: request.nextUrl.pathname,
          validationErrors,
        });

        return NextResponse.json(
          {
            error: "Validation failed",
            code: "VALIDATION_ERROR",
            details: validationErrors,
          },
          { status: 400 }
        );
      }

      throw error;
    }
  };
}

export function validateQuery<T>(
  schema: ZodSchema<T>,
  handler: (request: NextRequest, data: T, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      const url = new URL(request.url);
      const params: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      const validatedData = schema.parse(params);
      return await handler(request, validatedData, context);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.issues.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        logger.warn("Query validation error", {
          path: request.nextUrl.pathname,
          validationErrors,
        });

        return NextResponse.json(
          {
            error: "Invalid query parameters",
            code: "VALIDATION_ERROR",
            details: validationErrors,
          },
          { status: 400 }
        );
      }

      throw error;
    }
  };
}
