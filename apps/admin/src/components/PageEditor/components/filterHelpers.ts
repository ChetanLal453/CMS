import type { FilterOption, FilterValue } from '@uadmin/shared/blocks/filter'

/**
 * Parses a raw string from URL query param or LocalStorage into a FilterValue.
 * Attempts JSON.parse if the value appears to be JSON (array, object, boolean, number),
 * otherwise returns the raw string.
 */
export function parseValue(raw: string | null | undefined): FilterValue {
  if (raw === null || raw === undefined) return undefined
  const trimmed = raw.trim()
  if (trimmed === '') return ''

  if (
    trimmed === 'true' ||
    trimmed === 'false' ||
    trimmed === 'null' ||
    (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (!Number.isNaN(Number(trimmed)) && !trimmed.includes('-'))
  ) {
    try {
      return JSON.parse(trimmed)
    } catch {
      return raw
    }
  }

  return raw
}

/**
 * Serializes a FilterValue into a string for URL or LocalStorage storage.
 */
export function serializeValue(value: FilterValue): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

/**
 * Checks if a FilterValue is considered empty.
 */
export function isValueEmpty(value: FilterValue): boolean {
  if (value === null || value === undefined || value === '') return true
  if (Array.isArray(value)) return value.length === 0
  return false
}

/**
 * Fetches dynamic filter options from an API endpoint and maps to FilterOption[] format.
 */
export async function fetchOptionsFromApi(
  apiEndpoint: string,
  apiMethod: string = 'GET',
  apiLabelField: string = 'label',
  apiValueField: string = 'value',
): Promise<FilterOption[]> {
  try {
    const response = await fetch(apiEndpoint, {
      method: apiMethod,
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API fetch failed with status ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const items = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.data)
          ? data.data
          : []

    return items.map((item: any) => ({
      label: String(item?.[apiLabelField] ?? item?.label ?? item?.name ?? item?.title ?? ''),
      value: String(item?.[apiValueField] ?? item?.value ?? item?.id ?? ''),
    }))
  } catch (error) {
    console.error('Failed to fetch filter options from API:', error)
    return []
  }
}
