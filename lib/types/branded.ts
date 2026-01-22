/**
 * Branded types for type safety
 * These prevent accidentally mixing up different ID types
 */

export type PumpId = string & { readonly __brand: unique symbol };
export type PumpReadingId = string & { readonly __brand: unique symbol };
export type PumpAlertId = string & { readonly __brand: unique symbol };
export type PumpConfigId = string & { readonly __brand: unique symbol };
export type PumpControlId = string & { readonly __brand: unique symbol };
export type UserId = string & { readonly __brand: unique symbol };

/**
 * Type guards for branded types
 */
export function isPumpId(id: string): id is PumpId {
  // UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function isUserId(id: string): id is UserId {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Type assertion helpers (use with caution)
 */
export function asPumpId(id: string): PumpId {
  if (!isPumpId(id)) {
    throw new Error(`Invalid pump ID: ${id}`);
  }
  return id as PumpId;
}

export function asUserId(id: string): UserId {
  if (!isUserId(id)) {
    throw new Error(`Invalid user ID: ${id}`);
  }
  return id as UserId;
}
