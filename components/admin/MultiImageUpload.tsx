// components/admin/MultiImageUpload.tsx
'use client'

import { useState } from 'react'
import { DatabaseService } from '@/lib/services/database.service'
import { Upload, X, Loader2, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface MultiImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
}

export function MultiImageUpload({ value, onChange, maxImages = 20 }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const remainingSlots = maxImages - value.length
    if (remainingSlots <= 0) {
      toast({
        title: 'Limit reached',
        description: `You can only upload up to ${maxImages} images per product.`,
        variant: 'destructive',
      })
      return
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots)
    if (files.length > remainingSlots) {
      toast({
        title: 'Some images skipped',
        description: `Only ${remainingSlots} more image(s) could be added (max ${maxImages}).`,
        variant: 'default',
      })
    }

    setUploading(true)
    try {
      const supabase = DatabaseService.getSupabaseClient()
      const uploadedUrls: string[] = []

      for (const file of filesToUpload) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file)

        if (uploadError) {
          console.error('Upload error for', file.name, uploadError)
          continue
        }

        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
        uploadedUrls.push(data.publicUrl)
      }

      if (uploadedUrls.length > 0) {
        onChange([...value, ...uploadedUrls])
        toast({
          title: `${uploadedUrls.length} image(s) uploaded!`,
          variant: 'success',
        })
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
      e.target.value = '' 
    }
  }

  // ✅ Updated: Open confirmation modal before deleting
  const confirmDelete = (index: number) => {
    setDeleteIndex(index)
    setIsDeleteModalOpen(true)
  }

  // ✅ Execute deletion after confirmation
  const handleDeleteConfirm = () => {
    if (deleteIndex !== null) {
      const newImages = value.filter((_, i) => i !== deleteIndex)
      onChange(newImages)
      toast({
        title: 'Image removed',
        description: 'The image has been deleted successfully.',
        variant: 'success',
      })
    }
    setIsDeleteModalOpen(false)
    setDeleteIndex(null)
  }

  // ✅ Cancel deletion
  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false)
    setDeleteIndex(null)
  }

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= value.length) return

    const newImages = [...value]
    ;[newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]]
    onChange(newImages)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {value.length} / {maxImages} images
        </span>
        {value.length > 0 && (
          <span className="text-xs text-gray-500">First image is the main product photo</span>
        )}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
        {value.map((url, index) => (
          <div
            key={url + index}
            className="relative aspect-square rounded-lg overflow-hidden border border-theme/20 group"
          >
            <Image src={url} alt={`Product image ${index + 1}`} fill className="object-contain" />
            {index === 0 && (
              <span className="absolute top-1 left-1 bg-theme-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                MAIN
              </span>
            )}
            
            {/* Delete button - top right corner */}
            <button
              type="button"
              onClick={() => confirmDelete(index)}
              className="absolute top-1 right-1 bg-black/70 rounded-full p-1 text-white hover:bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>

            {/* Move buttons - bottom center, separate and evenly spaced */}
            <div className="absolute bottom-1 left-1 right-1 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => moveImage(index, 'left')}
                disabled={index === 0}
                className="bg-black/70 rounded p-1 text-white hover:bg-theme-500/80 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => moveImage(index, 'right')}
                disabled={index === value.length - 1}
                className="bg-black/70 rounded p-1 text-white hover:bg-theme-500/80 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}

        {value.length < maxImages && (
          <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-theme/30 cursor-pointer hover:border-theme/50 transition-colors">
            {uploading ? (
              <Loader2 className="h-5 w-5 text-theme animate-spin" />
            ) : (
              <>
                <Upload className="h-5 w-5 text-theme mb-1" />
                <span className="text-[10px] text-gray-400 text-center px-1">Add images</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFilesChange}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {/* ✅ Custom Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="glass border border-theme/20 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Delete Image</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to remove this image? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              className="border-theme/20 text-white hover:bg-theme/10 flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 text-white flex-1"
            >
              Delete Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}