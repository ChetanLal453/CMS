export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textMuted: string
  border: string
}

export interface ThemeTypography {
  fontFamily: string
  headingFontFamily?: string
  h1Size: string
  h2Size: string
  h3Size: string
  bodySize: string
  baseLineHeight: string
}

export interface ThemeStyles {
  borderRadius: number | string
  boxShadow: string
}

export interface GlobalTheme {
  preset: string
  colors: ThemeColors
  typography: ThemeTypography
  styles: ThemeStyles
  customCSS?: string
}

export interface ThemePreset {
  id: string
  name: string
  description: string
  isDark: boolean
  theme: Omit<GlobalTheme, 'customCSS'>
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
  'dark-slate': {
    id: 'dark-slate',
    name: 'Dark Slate (Default)',
    description: 'Modern dark theme with neon violet accents',
    isDark: true,
    theme: {
      preset: 'dark-slate',
      colors: {
        primary: '#7c6dfa',
        secondary: '#a594ff',
        accent: '#3ecf8e',
        background: '#0d0f14',
        surface: '#13161e',
        text: '#e8eaf0',
        textMuted: '#8b90a8',
        border: 'rgba(255, 255, 255, 0.08)',
      },
      typography: {
        fontFamily: "'DM Sans', system-ui, sans-serif",
        headingFontFamily: "'DM Sans', system-ui, sans-serif",
        h1Size: '2.5rem',
        h2Size: '2rem',
        h3Size: '1.5rem',
        bodySize: '1rem',
        baseLineHeight: '1.6',
      },
      styles: {
        borderRadius: 8,
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
      },
    },
  },
  'clean-light': {
    id: 'clean-light',
    name: 'Clean Light',
    description: 'Crisp, high-contrast light theme with royal blue accents',
    isDark: false,
    theme: {
      preset: 'clean-light',
      colors: {
        primary: '#2563eb',
        secondary: '#3b82f6',
        accent: '#059669',
        background: '#f8fafc',
        surface: '#ffffff',
        text: '#0f172a',
        textMuted: '#64748b',
        border: '#e2e8f0',
      },
      typography: {
        fontFamily: "'Inter', system-ui, sans-serif",
        headingFontFamily: "'Inter', system-ui, sans-serif",
        h1Size: '2.5rem',
        h2Size: '2rem',
        h3Size: '1.5rem',
        bodySize: '1rem',
        baseLineHeight: '1.6',
      },
      styles: {
        borderRadius: 8,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      },
    },
  },
  'emerald-tech': {
    id: 'emerald-tech',
    name: 'Emerald Tech',
    description: 'Deep forest dark theme with vibrant emerald and cyan accents',
    isDark: true,
    theme: {
      preset: 'emerald-tech',
      colors: {
        primary: '#10b981',
        secondary: '#34d399',
        accent: '#06b6d4',
        background: '#091310',
        surface: '#11221b',
        text: '#ecfdf5',
        textMuted: '#6ee7b7',
        border: 'rgba(16, 185, 129, 0.15)',
      },
      typography: {
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        headingFontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        h1Size: '2.6rem',
        h2Size: '2.1rem',
        h3Size: '1.55rem',
        bodySize: '1rem',
        baseLineHeight: '1.65',
      },
      styles: {
        borderRadius: 10,
        boxShadow: '0 8px 24px rgba(0,20,10,0.4)',
      },
    },
  },
  'ocean-blue': {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Deep midnight navy with electric sky blue and indigo accents',
    isDark: true,
    theme: {
      preset: 'ocean-blue',
      colors: {
        primary: '#0ea5e9',
        secondary: '#38bdf8',
        accent: '#6366f1',
        background: '#0b1329',
        surface: '#131f37',
        text: '#f0f9ff',
        textMuted: '#7dd3fc',
        border: 'rgba(14, 165, 233, 0.16)',
      },
      typography: {
        fontFamily: "'DM Sans', system-ui, sans-serif",
        headingFontFamily: "'DM Sans', system-ui, sans-serif",
        h1Size: '2.5rem',
        h2Size: '2rem',
        h3Size: '1.5rem',
        bodySize: '1rem',
        baseLineHeight: '1.6',
      },
      styles: {
        borderRadius: 12,
        boxShadow: '0 8px 28px rgba(2,6,23,0.45)',
      },
    },
  },
  'sunset-amber': {
    id: 'sunset-amber',
    name: 'Sunset Amber',
    description: 'Warm obsidian theme with amber, gold, and coral hues',
    isDark: true,
    theme: {
      preset: 'sunset-amber',
      colors: {
        primary: '#f59e0b',
        secondary: '#fbbf24',
        accent: '#ef4444',
        background: '#14100c',
        surface: '#211a14',
        text: '#fffbeb',
        textMuted: '#d97706',
        border: 'rgba(245, 158, 11, 0.16)',
      },
      typography: {
        fontFamily: "'Poppins', system-ui, sans-serif",
        headingFontFamily: "'Poppins', system-ui, sans-serif",
        h1Size: '2.5rem',
        h2Size: '2rem',
        h3Size: '1.5rem',
        bodySize: '1rem',
        baseLineHeight: '1.6',
      },
      styles: {
        borderRadius: 8,
        boxShadow: '0 8px 24px rgba(20,10,0,0.4)',
      },
    },
  },
  'cyberpunk': {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Ultra high-contrast neon pink and cyber yellow aesthetic',
    isDark: true,
    theme: {
      preset: 'cyberpunk',
      colors: {
        primary: '#f43f5e',
        secondary: '#fb7185',
        accent: '#eab308',
        background: '#08060e',
        surface: '#140f24',
        text: '#faf5ff',
        textMuted: '#c084fc',
        border: 'rgba(244, 63, 94, 0.25)',
      },
      typography: {
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
        headingFontFamily: "'Space Grotesk', system-ui, sans-serif",
        h1Size: '2.75rem',
        h2Size: '2.2rem',
        h3Size: '1.6rem',
        bodySize: '1rem',
        baseLineHeight: '1.5',
      },
      styles: {
        borderRadius: 4,
        boxShadow: '0 0 20px rgba(244,63,94,0.2)',
      },
    },
  },
}

export const FONT_OPTIONS = [
  { value: "'DM Sans', system-ui, sans-serif", label: 'DM Sans (Clean Modern)' },
  { value: "'Inter', system-ui, sans-serif", label: 'Inter (High Legibility)' },
  { value: "'Plus Jakarta Sans', system-ui, sans-serif", label: 'Plus Jakarta Sans (Geometric)' },
  { value: "'Poppins', system-ui, sans-serif", label: 'Poppins (Friendly & Rounded)' },
  { value: "'Space Grotesk', system-ui, sans-serif", label: 'Space Grotesk (Tech & Editorial)' },
  { value: "system-ui, -apple-system, sans-serif", label: 'System UI (Native)' },
]

export const RADIUS_PRESETS = [
  { value: 0, label: 'Sharp (0px)' },
  { value: 6, label: 'Subtle (6px)' },
  { value: 8, label: 'Standard (8px)' },
  { value: 12, label: 'Rounded (12px)' },
  { value: 16, label: 'Soft (16px)' },
  { value: 9999, label: 'Pill (Full)' },
]

export const getDefaultTheme = (): GlobalTheme => {
  return JSON.parse(JSON.stringify(THEME_PRESETS['dark-slate'].theme))
}

export const applyThemePreset = (currentTheme: GlobalTheme | undefined, presetKey: string): GlobalTheme => {
  const preset = THEME_PRESETS[presetKey]
  if (!preset) {
    return currentTheme || getDefaultTheme()
  }

  return {
    ...preset.theme,
    customCSS: currentTheme?.customCSS || '',
  }
}

export const generateThemeCssVariables = (theme?: GlobalTheme): React.CSSProperties => {
  const activeTheme = theme || getDefaultTheme()
  const { colors, typography, styles } = activeTheme

  return {
    '--theme-primary': colors.primary,
    '--theme-secondary': colors.secondary,
    '--theme-accent': colors.accent,
    '--theme-bg': colors.background,
    '--theme-surface': colors.surface,
    '--theme-text': colors.text,
    '--theme-text-muted': colors.textMuted,
    '--theme-border': colors.border,
    '--theme-font-family': typography.fontFamily,
    '--theme-heading-font-family': typography.headingFontFamily || typography.fontFamily,
    '--theme-h1-size': typography.h1Size,
    '--theme-h2-size': typography.h2Size,
    '--theme-h3-size': typography.h3Size,
    '--theme-body-size': typography.bodySize,
    '--theme-line-height': typography.baseLineHeight,
    '--theme-radius': typeof styles.borderRadius === 'number' ? `${styles.borderRadius}px` : styles.borderRadius,
    '--theme-shadow': styles.boxShadow,
  } as React.CSSProperties
}
