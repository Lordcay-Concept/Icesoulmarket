// components/admin/ThemePicker.tsx
'use client'

import { useState } from 'react'
import { THEME_PRESETS } from '@/lib/themes/presets'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

interface ThemePickerProps {
  currentThemeId: string
  currentCustomColors: { primary: string; secondary: string; glow: string } | null
  onSave: (themeId: string, customColors: { primary: string; secondary: string; glow: string } | null) => void
}

export function ThemePicker({ currentThemeId, currentCustomColors, onSave }: ThemePickerProps) {
  const [selectedId, setSelectedId] = useState(currentThemeId)
  const [customColors, setCustomColors] = useState(
    currentCustomColors || { primary: '#00ff64', secondary: '#00cc52', glow: '#00ff64' }
  )

  const handleSave = () => {
    onSave(selectedId, selectedId === 'custom' ? customColors : null)
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-gray-300 mb-3 block">Choose a Theme</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {THEME_PRESETS.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => setSelectedId(theme.id)}
              className={`relative p-3 rounded-xl border-2 transition-all text-left ${
                selectedId === theme.id ? 'border-white' : 'border-transparent hover:border-white/30'
              }`}
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              }}
            >
              {selectedId === theme.id && (
                <Check className="absolute top-2 right-2 h-4 w-4" style={{ color: theme.textOnPrimary }} />
              )}
              <span
                className="text-xs font-semibold block"
                style={{ color: theme.textOnPrimary }}
              >
                {theme.name}
              </span>
            </button>
          ))}

          <button
            type="button"
            onClick={() => setSelectedId('custom')}
            className={`relative p-3 rounded-xl border-2 transition-all text-left flex items-center justify-center bg-black/50 ${
              selectedId === 'custom' ? 'border-white' : 'border-gray-700 hover:border-white/30'
            }`}
          >
            <span className="text-xs font-semibold text-gray-300">+ Custom</span>
          </button>
        </div>
      </div>

      {selectedId === 'custom' && (
        <div className="p-4 rounded-xl bg-black/50 border border-gray-700 space-y-4">
          <p className="text-sm text-gray-400">Pick your own colors for a fully custom theme.</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">Primary</Label>
              <input
                type="color"
                value={customColors.primary}
                onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                className="w-full h-10 rounded-lg cursor-pointer bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">Secondary</Label>
              <input
                type="color"
                value={customColors.secondary}
                onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                className="w-full h-10 rounded-lg cursor-pointer bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">Glow</Label>
              <input
                type="color"
                value={customColors.glow}
                onChange={(e) => setCustomColors({ ...customColors, glow: e.target.value })}
                className="w-full h-10 rounded-lg cursor-pointer bg-transparent"
              />
            </div>
          </div>
          <div
            className="h-16 rounded-lg flex items-center justify-center font-bold"
            style={{
              background: `linear-gradient(135deg, ${customColors.primary}, ${customColors.secondary})`,
              color: '#000',
            }}
          >
            Preview
          </div>
        </div>
      )}

      <Button onClick={handleSave} className="gaming-btn">
        Save Theme
      </Button>
    </div>
  )
}