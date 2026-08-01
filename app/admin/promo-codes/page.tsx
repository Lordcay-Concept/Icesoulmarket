// app/admin/promo-codes/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { DatabaseService } from '@/lib/services/database.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tag, Plus, X, Check, Trash2, TrendingUp } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { useCurrency } from '@/lib/hooks/useCurrency'

interface PromoCode {
  id: string
  code: string
  partner_name: string
  partner_email: string | null
  discount_percentage: number
  commission_percentage: number
  is_active: boolean
  expires_at: string | null
}

interface CodeStats {
  promo_code_id: string
  uses: number
  total_discount_given: number
  total_commission_owed: number
}

export default function AdminPromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([])
  const [stats, setStats] = useState<Record<string, CodeStats>>({})
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { formatPrice } = useCurrency()
  const [formData, setFormData] = useState({
    code: '',
    partner_name: '',
    partner_email: '',
    discount_percentage: '',
    commission_percentage: '',
    expires_at: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const supabase = DatabaseService.getSupabaseClient()

      const { data: codesData, error: codesError } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false })

      if (codesError) throw codesError
      setCodes(codesData || [])

      const { data: usagesData, error: usagesError } = await supabase
        .from('promo_code_usages')
        .select('promo_code_id, discount_amount, commission_amount')

      if (usagesError) throw usagesError

      const statsMap: Record<string, CodeStats> = {}
      for (const usage of usagesData || []) {
        if (!statsMap[usage.promo_code_id]) {
          statsMap[usage.promo_code_id] = {
            promo_code_id: usage.promo_code_id,
            uses: 0,
            total_discount_given: 0,
            total_commission_owed: 0,
          }
        }
        statsMap[usage.promo_code_id].uses += 1
        statsMap[usage.promo_code_id].total_discount_given += usage.discount_amount
        statsMap[usage.promo_code_id].total_commission_owed += usage.commission_amount
      }
      setStats(statsMap)
    } catch (error) {
      console.error('Error loading promo codes:', error)
      toast({ title: 'Error', description: 'Failed to load promo codes', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = DatabaseService.getSupabaseClient()
      const { error } = await supabase.from('promo_codes').insert({
        code: formData.code.toUpperCase().trim(),
        partner_name: formData.partner_name,
        partner_email: formData.partner_email || null,
        discount_percentage: parseFloat(formData.discount_percentage),
        commission_percentage: parseFloat(formData.commission_percentage),
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
      })

      if (error) throw error

      toast({ title: 'Success!', description: 'Promo code created', variant: 'success' })
      setIsModalOpen(false)
      setFormData({ code: '', partner_name: '', partner_email: '', discount_percentage: '', commission_percentage: '', expires_at: '' })
      loadData()
    } catch (error: any) {
      console.error('Error creating promo code:', error)
      toast({
        title: 'Error',
        description: error.message?.includes('duplicate') ? 'This code already exists' : 'Failed to create code',
        variant: 'destructive',
      })
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const supabase = DatabaseService.getSupabaseClient()
      await supabase.from('promo_codes').update({ is_active: !current }).eq('id', id)
      loadData()
    } catch (error) {
      console.error('Error toggling code:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promo code? Past usage records will be kept for your records.')) return
    try {
      const supabase = DatabaseService.getSupabaseClient()
      await supabase.from('promo_codes').delete().eq('id', id)
      toast({ title: 'Deleted', variant: 'success' })
      loadData()
    } catch (error) {
      console.error('Error deleting code:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="text-gray-400">Loading...</div></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white"><span className="text-emerald-400 neon-glow">Promo Codes</span></h1>
          <p className="text-gray-400 mt-1">Manage partner discount codes and commissions</p>
        </div>
        <Button className="gaming-btn" onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Code
        </Button>
      </div>

      <div className="space-y-4">
        {codes.map((code) => {
          const codeStats = stats[code.id]
          return (
            <Card key={code.id} className="glass border-emerald-400/10 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-emerald-400" />
                      <span className="text-white font-mono font-bold text-lg">{code.code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${code.is_active ? 'bg-emerald-400/20 text-emerald-400' : 'bg-gray-400/20 text-gray-400'}`}>
                        {code.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Partner: {code.partner_name} {code.partner_email && `• ${code.partner_email}`}
                    </p>
                    <p className="text-sm text-gray-400">
                      {code.discount_percentage}% customer discount • {code.commission_percentage}% partner commission
                    </p>
                    {code.expires_at && (
                      <p className="text-xs text-gray-500 mt-1">Expires {new Date(code.expires_at).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-emerald-400/20" onClick={() => toggleActive(code.id, code.is_active)}>
                      {code.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-400/20 text-red-400" onClick={() => handleDelete(code.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {codeStats && (
                  <div className="mt-4 pt-4 border-t border-emerald-400/10 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Times Used</p>
                      <p className="text-white font-bold flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-emerald-400" /> {codeStats.uses}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Discount Given</p>
                      <p className="text-white font-bold">{formatPrice(codeStats.total_discount_given)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Commission Owed</p>
                      <p className="text-emerald-400 font-bold">{formatPrice(codeStats.total_commission_owed)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {codes.length === 0 && (
        <div className="text-center py-12">
          <Tag className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No promo codes yet</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass rounded-2xl border border-emerald-400/20 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">New Promo Code</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Code</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="STREAMER20"
                  className="bg-black/50 border-emerald-400/20 text-white uppercase"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Partner Name</Label>
                <Input
                  value={formData.partner_name}
                  onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                  placeholder="John's Gaming Channel"
                  className="bg-black/50 border-emerald-400/20 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Partner Email (optional)</Label>
                <Input
                  type="email"
                  value={formData.partner_email}
                  onChange={(e) => setFormData({ ...formData, partner_email: e.target.value })}
                  className="bg-black/50 border-emerald-400/20 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Discount %</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                    placeholder="15"
                    className="bg-black/50 border-emerald-400/20 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Commission %</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.commission_percentage}
                    onChange={(e) => setFormData({ ...formData, commission_percentage: e.target.value })}
                    placeholder="10"
                    className="bg-black/50 border-emerald-400/20 text-white"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Expiry Date (optional)</Label>
                <Input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="bg-black/50 border-emerald-400/20 text-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1 gaming-btn">
                  <Check className="mr-2 h-4 w-4" /> Create
                </Button>
                <Button type="button" variant="outline" className="flex-1 border-emerald-400/20" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}