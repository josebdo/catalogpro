"use client"

import { useState, useRef } from "react"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Image from "next/image"

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void
  onUploadError?: (error: string) => void
  existingUrl?: string | null
  bucket?: string
  accentColor?: string
}

export function ImageUploader({ 
  onUploadSuccess, 
  onUploadError, 
  existingUrl,
  bucket = 'products',
  accentColor = '#25D366'
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Verify file type
    if (!file.type.startsWith('image/')) {
      const errorMsg = 'El archivo debe ser una imagen'
      toast.error(errorMsg)
      onUploadError?.(errorMsg)
      return
    }

    // Verify size (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = 'La imagen no debe superar los 5MB'
      toast.error(errorMsg)
      onUploadError?.(errorMsg)
      return
    }

    setIsUploading(true)

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        throw new Error('No autorizado')
      }

      // Upload to user's folder inside the bucket
      const filePath = `${session.user.id}/${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      onUploadSuccess(publicUrl)
      toast.success('Imagen subida correctamente')

    } catch (error: any) {
      console.error('Error uploading image:', error)
      const errorMsg = error.message || 'Error al subir la imagen'
      toast.error(errorMsg)
      onUploadError?.(errorMsg)
      // Revert preview on failure
      setPreviewUrl(existingUrl || null)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    onUploadSuccess('') // Empty string to clear in DB
  }

  return (
    <div className="w-full">
      <input
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative rounded-lg border overflow-hidden aspect-video bg-muted flex items-center justify-center group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={previewUrl} 
            alt="Product preview" 
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors backdrop-blur-sm"
              disabled={isUploading}
            >
              <Upload className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-sm"
              disabled={isUploading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full border-2 border-dashed rounded-lg p-8 text-center transition-all flex flex-col items-center justify-center gap-3 relative hover:bg-muted/50 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: accentColor }} />
          ) : (
            <>
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center bg-muted/50"
                style={{ color: accentColor }}
              >
                <ImageIcon className="h-6 w-6 opacity-70" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Clic para subir imagen
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG o WEBP (Max 5MB)
                </p>
              </div>
            </>
          )}
        </button>
      )}
    </div>
  )
}
