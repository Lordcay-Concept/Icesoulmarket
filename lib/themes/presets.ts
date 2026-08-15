// lib/themes/presets.ts

export interface ThemePreset {
  id: string
  name: string
  primary: string      // main brand color (buttons, links, primary accents)
  secondary: string     // gradient partner color
  glow: string          // used for neon-glow / shadow effects (usually matches primary, sometimes brighter)
  textOnPrimary: string // text color that sits ON TOP of primary (usually black or white)
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'emerald-storm',  name: 'Emerald Storm',  primary: '#00ff64', secondary: '#00cc52', glow: '#00ff64', textOnPrimary: '#000000' },
  { id: 'cyber-blue',     name: 'Cyber Blue',      primary: '#00d4ff', secondary: '#0088cc', glow: '#00d4ff', textOnPrimary: '#000000' },
  { id: 'neon-purple',    name: 'Neon Purple',     primary: '#b026ff', secondary: '#7b1fa2', glow: '#c77dff', textOnPrimary: '#ffffff' },
  { id: 'blood-red-ops',  name: 'Blood Red Ops',   primary: '#ff1744', secondary: '#b71c1c', glow: '#ff1744', textOnPrimary: '#ffffff' },
  { id: 'toxic-green',    name: 'Toxic Green',     primary: '#adff2f', secondary: '#76c000', glow: '#adff2f', textOnPrimary: '#000000' },
  { id: 'arctic-frost',   name: 'Arctic Frost',    primary: '#7fdbff', secondary: '#39a0ed', glow: '#a8e6ff', textOnPrimary: '#000000' },
  { id: 'molten-orange',  name: 'Molten Orange',   primary: '#ff6b00', secondary: '#cc4400', glow: '#ff8c00', textOnPrimary: '#000000' },
  { id: 'deep-space',     name: 'Deep Space',      primary: '#6c5ce7', secondary: '#4834d4', glow: '#a29bfe', textOnPrimary: '#ffffff' },
  { id: 'gold-rush',      name: 'Gold Rush',       primary: '#ffd700', secondary: '#daa520', glow: '#ffd700', textOnPrimary: '#000000' },
  { id: 'plasma-pink',    name: 'Plasma Pink',     primary: '#ff2d95', secondary: '#c2185b', glow: '#ff6bb5', textOnPrimary: '#ffffff' },
  { id: 'stealth-grey',   name: 'Stealth Grey',    primary: '#c0c0c0', secondary: '#808080', glow: '#e0e0e0', textOnPrimary: '#000000' },
  { id: 'radioactive',    name: 'Radioactive Yellow', primary: '#eeff00', secondary: '#bfd400', glow: '#eeff00', textOnPrimary: '#000000' },
  { id: 'ocean-depths',   name: 'Ocean Depths',    primary: '#00bfa5', secondary: '#00796b', glow: '#1de9b6', textOnPrimary: '#000000' },
  { id: 'crimson-elite',  name: 'Crimson Elite',   primary: '#dc143c', secondary: '#8b0000', glow: '#ff4d6d', textOnPrimary: '#ffffff' },
  { id: 'void-black',     name: 'Void Black',      primary: '#3d5afe', secondary: '#0039cb', glow: '#8c9eff', textOnPrimary: '#ffffff' },
  { id: 'solar-flare',    name: 'Solar Flare',     primary: '#ff4500', secondary: '#ff8c00', glow: '#ffae00', textOnPrimary: '#000000' },
  { id: 'hacker-green',   name: 'Hacker Green',    primary: '#39ff14', secondary: '#00cc00', glow: '#39ff14', textOnPrimary: '#000000' },
  { id: 'royal-violet',   name: 'Royal Violet',    primary: '#9d4edd', secondary: '#5a189a', glow: '#c77dff', textOnPrimary: '#ffffff' },
  { id: 'chrome-steel',   name: 'Chrome Steel',    primary: '#8ecae6', secondary: '#4a7a96', glow: '#bde0fe', textOnPrimary: '#000000' },
  { id: 'inferno',        name: 'Inferno',         primary: '#ff0000', secondary: '#8b0000', glow: '#ff4500', textOnPrimary: '#ffffff' },
]

export function getPresetById(id: string): ThemePreset | undefined {
  return THEME_PRESETS.find((t) => t.id === id)
}