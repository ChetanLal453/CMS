const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on'])

function normalizeFlagValue(value) {
  if (typeof value === 'boolean') {
    return value
  }

  if (value == null) {
    return null
  }

  return TRUE_VALUES.has(String(value).trim().toLowerCase())
}

export function isFeatureEnabled(flagName, fallback = false) {
  const value = normalizeFlagValue(process.env[flagName])
  return value == null ? fallback : value
}

export const featureFlags = {
  revisionWrites: () => isFeatureEnabled('CMS_REVISION_WRITES', true),
  dualWriteLegacyPageJson: () => isFeatureEnabled('CMS_DUAL_WRITE_LEGACY_PAGE_JSON', false),
  editorReadsCurrentRevision: () => isFeatureEnabled('CMS_EDITOR_READS_CURRENT_REVISION', true),
  publicReadsPublishedRevision: () => isFeatureEnabled('CMS_PUBLIC_READS_PUBLISHED_REVISION', true),
  templatesV2: () => isFeatureEnabled('CMS_TEMPLATES_V2', false),
  menusV2: () => isFeatureEnabled('CMS_MENUS_V2', false),
  disableLegacySectionSync: () => isFeatureEnabled('CMS_DISABLE_LEGACY_SECTION_SYNC', false),
}
