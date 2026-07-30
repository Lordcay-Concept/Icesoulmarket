// components/admin/ImageUpload.tsx
'use client'

import { useState } from 'react'
import { DatabaseService } from '@/lib/services/database.service'
import { Upload, X, Loader2 } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import Image from 'next/image'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const supabase = DatabaseService.getSupabaseClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      onChange(data.publicUrl)
      toast({ title: 'Image uploaded!', variant: 'success' })
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-emerald-400/20">
          <Image src={value} alt="Product" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1 right-1 bg-black/70 rounded-full p-1 text-white hover:bg-red-500/80"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-32 h-32 rounded-lg border-2 border-dashed border-emerald-400/30 cursor-pointer hover:border-emerald-400/50 transition-colors">
          {uploading ? (
            <Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
          ) : (
            <>
              <Upload className="h-6 w-6 text-emerald-400 mb-1" />
              <span className="text-xs text-gray-400">Upload</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  )
}