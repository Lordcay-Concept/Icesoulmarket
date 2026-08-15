// lib/themes/applyTheme.ts
import { getPresetById, ThemePreset } from './presets'

export interface CustomThemeColors {
  primary: string
  secondary: string
  glow: string
}

// Determines text color (black/white) automatically for custom colors,
// based on the color's brightness — so custom themes stay readable
// without the admin having to think about contrast.
function getReadableTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 150 ? '#000000' : '#ffffff'
}

export function applyTheme(themeId: string, customColors?: CustomThemeColors | null) {
  let theme: ThemePreset

  if (themeId === 'custom' && customColors) {
    theme = {
      id: 'custom',
      name: 'Custom',
      primary: customColors.primary,
      secondary: customColors.secondary,
      glow: customColors.glow,
      textOnPrimary: getReadableTextColor(customColors.primary),
    }
  } else {
    theme = getPresetById(themeId) || getPresetById('emerald-storm')!
  }

  const root = document.documentElement
  root.style.setProperty('--theme-primary', theme.primary)
  root.style.setProperty('--theme-secondary', theme.secondary)
  root.style.setProperty('--theme-glow', theme.glow)
  root.style.setProperty('--theme-text-on-primary', theme.textOnPrimary)
}