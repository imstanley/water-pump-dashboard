export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly metadata?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.metadata = metadata;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly validationErrors: Array<{ path: string; message: string }>;

  constructor(
    message: string,
    validationErrors: Array<{ path: string; message: string }>,
    metadata?: Record<string, unknown>
  ) {
    super(message, "VALIDATION_ERROR", 400, true, metadata);
    this.name = "ValidationError";
    this.validationErrors = validationErrors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required", metadata?: Record<string, unknown>) {
    super(message, "AUTHENTICATION_ERROR", 401, true, metadata);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions", metadata?: Record<string, unknown>) {
    super(message, "AUTHORIZATION_ERROR", 403, true, metadata);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string, metadata?: Record<string, unknown>) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    super(message, "NOT_FOUND", 404, true, metadata);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, "CONFLICT", 409, true, metadata);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Rate limit exceeded", metadata?: Record<string, unknown>) {
    super(message, "RATE_LIMIT_EXCEEDED", 429, true, metadata);
    this.name = "RateLimitError";
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: unknown, metadata?: Record<string, unknown>) {
    super(
      message,
      "DATABASE_ERROR",
      500,
      false,
      originalError ? { originalError, ...metadata } : metadata
    );
    this.name = "DatabaseError";
  }
}

export class ExternalAPIError extends AppError {
  constructor(
    message: string,
    statusCode: number = 502,
    originalError?: unknown,
    metadata?: Record<string, unknown>
  ) {
    super(
      message,
      "EXTERNAL_API_ERROR",
      statusCode,
      true,
      originalError ? { originalError, ...metadata } : metadata
    );
    this.name = "ExternalAPIError";
  }
}
