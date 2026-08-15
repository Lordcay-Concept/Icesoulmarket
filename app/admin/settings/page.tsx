// app/admin/settings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { DatabaseService } from '@/lib/services/database.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { CURRENCIES } from '@/lib/utils/currency'
import { ThemePicker } from '@/components/admin/ThemePicker'
import { applyTheme } from '@/lib/themes/applyTheme'
import {
  Building2,
  User,
  Hash,
  FileText,
  Save,
  Coins,
  Palette,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Settings as SettingsIcon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [expandedSection, setExpandedSection] = useState<string>('theme')
  const [bankSettings, setBankSettings] = useState({
    bank_name: '',
    account_name: '',
    account_number: '',
    branch: '',
    instructions: '',
  })
  const [defaultCurrency, setDefaultCurrency] = useState('USD')
  const [themeId, setThemeId] = useState('emerald-storm')
  const [customThemeColors, setCustomThemeColors] = useState<any>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const [bankData, storeSettings] = await Promise.all([
        DatabaseService.getBankSettings(),
        DatabaseService.getStoreSettings(),
      ])
      if (bankData) {
        setBankSettings({
          bank_name: bankData.bank_name || '',
          account_name: bankData.account_name || '',
          account_number: bankData.account_number || '',
          branch: bankData.branch || '',
          instructions: bankData.instructions || '',
        })
      }
      setDefaultCurrency(storeSettings?.default_currency || 'USD')
      setThemeId(storeSettings?.theme_id || 'emerald-storm')
      setCustomThemeColors(storeSettings?.custom_theme_colors || null)
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = DatabaseService.getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      await DatabaseService.updateBankSettings(bankSettings, user?.id || '')
      
      toast({
        title: 'Success!',
        description: 'Bank settings updated successfully',
        variant: 'success',
      })
    } catch (error) {
      console.error('Error updating settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive',
      })
    }
  }

  const handleCurrencySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = DatabaseService.getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      await DatabaseService.updateStoreSettings(defaultCurrency, user?.id || '')

      toast({
        title: 'Success!',
        description: 'Default currency updated.',
        variant: 'success',
      })
    } catch (error) {
      console.error('Error updating currency:', error)
      toast({
        title: 'Error',
        description: 'Failed to update currency',
        variant: 'destructive',
      })
    }
  }

  const handleThemeSave = async (newThemeId: string, newCustomColors: any) => {
    try {
      const supabase = DatabaseService.getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      await DatabaseService.updateTheme(newThemeId, newCustomColors, user?.id || '')

      setThemeId(newThemeId)
      setCustomThemeColors(newCustomColors)
      applyTheme(newThemeId, newCustomColors)

      toast({
        title: 'Theme updated!',
        description: 'The new theme is now live across the site.',
        variant: 'success',
      })
    } catch (error) {
      console.error('Error updating theme:', error)
      toast({
        title: 'Error',
        description: 'Failed to update theme',
        variant: 'destructive',
      })
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? '' : section)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading settings...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-theme neon-glow" />
          <h1 className="text-3xl font-bold text-white">
            <span className="text-theme neon-glow">Settings</span>
          </h1>
          <Sparkles className="h-5 w-5 text-theme-300 animate-pulse" />
        </div>
        <p className="text-gray-400 mt-1">Manage your store configuration and preferences</p>
      </div>

      <div className="space-y-4">
        {/* Theme Section */}
        <Card className="glass border-theme-20 rounded-2xl overflow-hidden">
          <div 
            className="flex items-center justify-between p-5 cursor-pointer hover:bg-theme-5 transition-colors"
            onClick={() => toggleSection('theme')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-theme-10">
                <Palette className="h-5 w-5 text-theme" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Platform Theme</h2>
                <p className="text-sm text-gray-400">Customize the look and feel of your store</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-theme-70">
                {themeId === 'custom' ? 'Custom Theme' : themeId.replace('-', ' ').toUpperCase()}
              </span>
              <button className="p-1 rounded-full hover:bg-theme-10 transition-colors text-gray-400 hover:text-white">
                {expandedSection === 'theme' ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <AnimatePresence>
            {expandedSection === 'theme' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="p-5 pt-0 border-t border-theme-10">
                  <ThemePicker
                    currentThemeId={themeId}
                    currentCustomColors={customThemeColors}
                    onSave={handleThemeSave}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Currency Section */}
        <Card className="glass border-theme-20 rounded-2xl overflow-hidden">
          <div 
            className="flex items-center justify-between p-5 cursor-pointer hover:bg-theme-5 transition-colors"
            onClick={() => toggleSection('currency')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-theme-10">
                <Coins className="h-5 w-5 text-theme" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Denomination Settings</h2>
                <p className="text-sm text-gray-400">Set your store&apos;s default currency</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-theme-70">
                {CURRENCIES[defaultCurrency as keyof typeof CURRENCIES]?.symbol} {defaultCurrency}
              </span>
              <button className="p-1 rounded-full hover:bg-theme-10 transition-colors text-gray-400 hover:text-white">
                {expandedSection === 'currency' ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <AnimatePresence>
            {expandedSection === 'currency' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="p-5 pt-0 border-t border-theme-10">
                  <form onSubmit={handleCurrencySubmit} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Default Store Currency</Label>
                      <select
                        value={defaultCurrency}
                        onChange={(e) => setDefaultCurrency(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-theme-20 focus:border-theme focus:ring-1 focus:ring-theme text-white transition-all"
                      >
                        {Object.entries(CURRENCIES).map(([code, { label, symbol }]) => (
                          <option key={code} value={code}>
                            {symbol} — {label} ({code})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-400">
                        This currency will be used as the default for all products and prices.
                      </p>
                    </div>
                    <Button type="submit" className="gaming-btn w-full">
                      <Save className="mr-2 h-4 w-4" />
                      Save Currency Setting
                    </Button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Bank Settings Section */}
        <Card className="glass border-theme-20 rounded-2xl overflow-hidden">
          <div 
            className="flex items-center justify-between p-5 cursor-pointer hover:bg-theme-5 transition-colors"
            onClick={() => toggleSection('bank')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-theme-10">
                <Building2 className="h-5 w-5 text-theme" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Bank Transfer Settings</h2>
                <p className="text-sm text-gray-400">Configure payment instructions for bank transfers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-theme" />
              <button className="p-1 rounded-full hover:bg-theme-10 transition-colors text-gray-400 hover:text-white">
                {expandedSection === 'bank' ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <AnimatePresence>
            {expandedSection === 'bank' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="p-5 pt-0 border-t border-theme-10">
                  <form onSubmit={handleBankSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Bank Name</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme" />
                          <Input
                            value={bankSettings.bank_name}
                            onChange={(e) => setBankSettings({ ...bankSettings, bank_name: e.target.value })}
                            className="pl-9 bg-black/50 border-theme-20 focus:border-theme focus:ring-1 focus:ring-theme text-white transition-all"
                            placeholder="e.g., Chase Bank"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Account Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme" />
                          <Input
                            value={bankSettings.account_name}
                            onChange={(e) => setBankSettings({ ...bankSettings, account_name: e.target.value })}
                            className="pl-9 bg-black/50 border-theme-20 focus:border-theme focus:ring-1 focus:ring-theme text-white transition-all"
                            placeholder="e.g., COD Gaming Shop"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Account Number</Label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme" />
                          <Input
                            value={bankSettings.account_number}
                            onChange={(e) => setBankSettings({ ...bankSettings, account_number: e.target.value })}
                            className="pl-9 bg-black/50 border-theme-20 focus:border-theme focus:ring-1 focus:ring-theme text-white transition-all"
                            placeholder="e.g., 1234567890"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Branch</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme" />
                          <Input
                            value={bankSettings.branch}
                            onChange={(e) => setBankSettings({ ...bankSettings, branch: e.target.value })}
                            className="pl-9 bg-black/50 border-theme-20 focus:border-theme focus:ring-1 focus:ring-theme text-white transition-all"
                            placeholder="e.g., Main Branch"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Payment Instructions</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-theme" />
                        <Textarea
                          value={bankSettings.instructions}
                          onChange={(e) => setBankSettings({ ...bankSettings, instructions: e.target.value })}
                          className="pl-9 bg-black/50 border-theme-20 focus:border-theme focus:ring-1 focus:ring-theme text-white min-h-[100px] transition-all"
                          placeholder="Instructions for customers making payments..."
                        />
                      </div>
                    </div>

                    <Button type="submit" className="gaming-btn w-full">
                      <Save className="mr-2 h-4 w-4" />
                      Save Bank Settings
                    </Button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  )
}