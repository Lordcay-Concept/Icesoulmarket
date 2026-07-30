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
import { 
  Settings,
  Building2,
  User,
  Hash,
  FileText,
  Save,
  Sparkles,
  Coins
} from 'lucide-react'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [bankSettings, setBankSettings] = useState({
    bank_name: '',
    account_name: '',
    account_number: '',
    branch: '',
    instructions: '',
  })
  const [defaultCurrency, setDefaultCurrency] = useState('USD')

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
        description: 'Default currency updated. This applies to all products unless a category has its own override.',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading settings...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          <span className="text-emerald-400 neon-glow">Settings</span>
        </h1>
        <p className="text-gray-400 mt-1">Manage bank details and configurations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Denomination Settings */}
        <Card className="glass border-emerald-400/10 rounded-2xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Coins className="h-5 w-5 text-emerald-400" />
              Denomination Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCurrencySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Default Store Currency</Label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-emerald-400/20 focus:border-emerald-400 text-white"
                >
                  {Object.entries(CURRENCIES).map(([code, { label, symbol }]) => (
                    <option key={code} value={code}>
                      {symbol} — {label} ({code})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  This applies to all products storewide. Individual categories can override this in the Categories page.
                </p>
              </div>

              <Button type="submit" className="gaming-btn w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Currency Setting
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Bank Settings */}
        <Card className="glass border-emerald-400/10 rounded-2xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-400" />
              Bank Transfer Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBankSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Bank Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                    <Input
                      value={bankSettings.bank_name}
                      onChange={(e) => setBankSettings({ ...bankSettings, bank_name: e.target.value })}
                      className="pl-9 bg-black/50 border-emerald-400/20 focus:border-emerald-400 text-white"
                      placeholder="e.g., Chase Bank"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Account Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                    <Input
                      value={bankSettings.account_name}
                      onChange={(e) => setBankSettings({ ...bankSettings, account_name: e.target.value })}
                      className="pl-9 bg-black/50 border-emerald-400/20 focus:border-emerald-400 text-white"
                      placeholder="e.g., COD Gaming Shop"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Account Number</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                    <Input
                      value={bankSettings.account_number}
                      onChange={(e) => setBankSettings({ ...bankSettings, account_number: e.target.value })}
                      className="pl-9 bg-black/50 border-emerald-400/20 focus:border-emerald-400 text-white"
                      placeholder="e.g., 1234567890"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Branch</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                    <Input
                      value={bankSettings.branch}
                      onChange={(e) => setBankSettings({ ...bankSettings, branch: e.target.value })}
                      className="pl-9 bg-black/50 border-emerald-400/20 focus:border-emerald-400 text-white"
                      placeholder="e.g., Main Branch"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Payment Instructions</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-emerald-400" />
                  <Textarea
                    value={bankSettings.instructions}
                    onChange={(e) => setBankSettings({ ...bankSettings, instructions: e.target.value })}
                    className="pl-9 bg-black/50 border-emerald-400/20 focus:border-emerald-400 text-white min-h-[100px]"
                    placeholder="Instructions for customers making payments..."
                  />
                </div>
              </div>

              <Button type="submit" className="gaming-btn w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Bank Settings
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}