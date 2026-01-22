import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  ExternalAPIError,
} from "./AppError";
import { logger } from "../logging/logger";

export function handleError(error: unknown): NextResponse {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.issues.map((err) => ({
      path: err.path.join("."),
      message: err.message,
    }));

    logger.warn("Validation error", { validationErrors, error });

    return NextResponse.json(
      {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: validationErrors,
      },
      { status: 400 }
    );
  }

  // Handle custom AppError instances
  if (error instanceof AppError) {
    const isDevelopment = process.env.NODE_ENV === "development";

    logger.error(`Application error: ${error.message}`, {
      code: error.code,
      statusCode: error.statusCode,
      metadata: error.metadata,
      stack: isDevelopment ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(error instanceof ValidationError && { details: error.validationErrors }),
        ...(isDevelopment && error.metadata && { metadata: error.metadata }),
      },
      { status: error.statusCode }
    );
  }

  // Handle unknown errors
  const isDevelopment = process.env.NODE_ENV === "development";
  const errorMessage = error instanceof Error ? error.message : "Internal server error";
  const errorStack = error instanceof Error ? error.stack : undefined;

  logger.error("Unexpected error", {
    error: errorMessage,
    stack: errorStack,
    type: typeof error,
  });

  return NextResponse.json(
    {
      error: "Internal server error",
      ...(isDevelopment && {
        message: errorMessage,
        stack: errorStack,
      }),
    },
    { status: 500 }
  );
}

export function handleClientError(error: unknown): {
  message: string;
  code?: string;
  details?: unknown;
} {
  if (error instanceof ZodError) {
    const firstError = error.issues[0];
    return {
      message: firstError?.message || "Validation failed",
      code: "VALIDATION_ERROR",
      details: error.issues,
    };
  }

  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      details: error.metadata,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || "An unexpected error occurred",
    };
  }

  return {
    message: "An unexpected error occurred",
  };
}
