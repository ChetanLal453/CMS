export function isDevelopmentRenderMode() {
  return process.env.NODE_ENV !== 'production'
}

export function reportCmsBoundaryViolation(componentName: string, message: string) {
  const error = new Error(`[CMS boundary] ${componentName}: ${message}`)

  if (isDevelopmentRenderMode()) {
    throw error
  }

  console.error(error.message)
  return null
}

export function reportRecoverableCmsBoundaryViolation(componentName: string, message: string) {
  const error = new Error(`[CMS boundary] ${componentName}: ${message}`)
  console.error(error.message)
  return null
}
