// src/utils/idNormalizer.ts
export const normalizeId = (id: string): string => {
  // Prefix with 'norm_' and replace colons with underscores for reversible DOM-safe IDs
  return 'norm_' + (id?.replace(/:/g, '_') || '')
}

export const denormalizeId = (id: string): string => {
  // Remove 'norm_' prefix and revert underscores back to colons
  if (id?.startsWith('norm_')) {
    return id.slice(5).replace(/_/g, ':')
  }
  return id || ''
}
