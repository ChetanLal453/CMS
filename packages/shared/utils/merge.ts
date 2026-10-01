/**
 * shared/utils/merge.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Generic deep-merge and primitive-coercion utilities used by all block
 * normalizers in shared/blocks/.
 *
 * Previously duplicated locally in:
 *   advancedheading/normalize.ts
 *   advancedparagraph/normalize.ts
 *   advancedcard/normalize.ts
 *   (asString/asBoolean/asNumber also copied in advancedlist, advancedaccordion,
 *    button, newgrid, image normalize.ts files)
 */

// ─── Object helpers ───────────────────────────────────────────────────────────

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

export function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item)) as T
  }

  if (isPlainObject(value)) {
    const output: Record<string, unknown> = {}
    for (const [key, nestedValue] of Object.entries(value)) {
      output[key] = cloneValue(nestedValue)
    }
    return output as T
  }

  return value
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K]
}

/**
 * Deep-merges multiple source objects from left to right.
 * Arrays are cloned (not merged). Undefined values are skipped.
 */
export function deepMerge<T>(...sources: Array<DeepPartial<T> | T | undefined>): T {
  const result: Record<string, unknown> = {}

  for (const source of sources) {
    if (!source || !isPlainObject(source)) {
      continue
    }

    for (const [key, value] of Object.entries(source)) {
      const current = result[key]

      if (Array.isArray(value)) {
        result[key] = value.map((item) => cloneValue(item))
        continue
      }

      if (isPlainObject(value)) {
        result[key] = isPlainObject(current)
          ? deepMerge(current as Record<string, unknown>, value as Record<string, unknown>)
          : deepMerge({}, value as Record<string, unknown>)
        continue
      }

      if (value !== undefined) {
        result[key] = value
      }
    }
  }

  return result as T
}

/**
 * Removes all keys whose value is `undefined` (deep).
 */
export function pruneUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => pruneUndefined(item)) as T
  }

  if (!isPlainObject(value)) {
    return value
  }

  const output: Record<string, unknown> = {}
  for (const [key, nestedValue] of Object.entries(value)) {
    if (nestedValue === undefined) continue
    output[key] = pruneUndefined(nestedValue)
  }

  return output as T
}

// ─── Primitive coercions ──────────────────────────────────────────────────────

/** Coerces `value` to a trimmed string, returning `fallback` for empty/nullish. */
export function asString(value: unknown, fallback: string): string {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

/** Coerces `value` to a boolean, supporting string truthy/falsy literals. */
export function asBoolean(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null) return fallback
  if (typeof value === 'boolean') return value

  const normalized = String(value).trim().toLowerCase()
  if (!normalized) return fallback
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true
  if (['false', '0', 'no', 'off'].includes(normalized)) return false
  return Boolean(value)
}

/** Coerces `value` to a finite number, returning `fallback` for non-finite results. */
export function asNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const parsed = Number.parseFloat(String(value ?? '').trim())
  return Number.isFinite(parsed) ? parsed : fallback
}

/**
 * Like `asNumber`, but additionally clamps to a minimum and rounds to integer.
 * Useful for row/column counts.
 */
export function asInteger(value: unknown, fallback: number, minimum = 1): number {
  const parsed =
    typeof value === 'number' ? value : Number.parseInt(String(value ?? '').trim(), 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(minimum, parsed)
}

/**
 * Coerces `value` to a string array.
 * Accepts arrays of strings or comma-separated strings.
 */
export function asStringArray(value: unknown, fallback: string[]): string[] {
  if (Array.isArray(value)) {
    const normalized = value.map((item) => String(item ?? '').trim()).filter(Boolean)
    return normalized.length ? normalized : [...fallback]
  }

  if (typeof value === 'string') {
    const normalized = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    return normalized.length ? normalized : [...fallback]
  }

  return [...fallback]
}
