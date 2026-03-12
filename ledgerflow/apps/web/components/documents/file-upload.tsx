'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface FileUploadProps {
  onUploadComplete: () => void
}

interface UploadingFile {
  file: File
  progress: number
  status: 'uploading' | 'processing' | 'complete' | 'error'
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
    }))

    setUploadingFiles(prev => [...prev, ...newFiles])

    // Upload each file
    for (const uploadingFile of newFiles) {
      try {
        const formData = new FormData()
        formData.append('file', uploadingFile.file)

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev =>
            prev.map(f =>
              f.file === uploadingFile.file && f.progress < 90
                ? { ...f, progress: f.progress + 10 }
                : f
            )
          )
        }, 200)

        const res = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        })

        clearInterval(progressInterval)

        if (res.ok) {
          setUploadingFiles(prev =>
            prev.map(f =>
              f.file === uploadingFile.file
                ? { ...f, progress: 100, status: 'complete' }
                : f
            )
          )
          toast.success(`${uploadingFile.file.name} subido correctamente`)
        } else {
          throw new Error('Upload failed')
        }
      } catch (error) {
        setUploadingFiles(prev =>
          prev.map(f =>
            f.file === uploadingFile.file
              ? { ...f, status: 'error' }
              : f
          )
        )
        toast.error(`Error al subir ${uploadingFile.file.name}`)
      }
    }

    // Remove completed files after a delay and call onUploadComplete
    setTimeout(() => {
      setUploadingFiles([])
      onUploadComplete()
    }, 2000)
  }, [onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  function removeFile(file: File) {
    setUploadingFiles(prev => prev.filter(f => f.file !== file))
  }

  return (
    <Card className="border-dashed border-2 border-indigo-500/30 bg-indigo-500/5">
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`
            flex flex-col items-center justify-center py-8 px-4 rounded-lg
            border-2 border-dashed transition-colors cursor-pointer
            ${isDragActive 
              ? 'border-indigo-500 bg-indigo-500/10' 
              : 'border-white/20 hover:border-white/40'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-indigo-400 mb-4" />
          <p className="text-lg font-medium text-white text-center">
            {isDragActive ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí'}
          </p>
          <p className="text-sm text-[var(--text-secondary)] mt-2 text-center">
            o haz clic para seleccionar archivos
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-4">
            PDF, Imágenes, Excel, CSV (máx. 10MB)
          </p>
        </div>

        {/* Uploading Files */}
        {uploadingFiles.length > 0 && (
          <div className="mt-6 space-y-3">
            {uploadingFiles.map((uploadingFile) => (
              <div
                key={uploadingFile.file.name}
                className="flex items-center gap-4 p-3 rounded-lg bg-[var(--bg-tertiary)]"
              >
                <File className="h-8 w-8 text-indigo-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {uploadingFile.file.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {(uploadingFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Progress value={uploadingFile.progress} className="mt-2" />
                </div>
                {uploadingFile.status === 'uploading' && (
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
                )}
                {uploadingFile.status === 'complete' && (
                  <span className="text-emerald-400 text-sm">✓</span>
                )}
                {uploadingFile.status === 'error' && (
                  <span className="text-red-400 text-sm">✗</span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeFile(uploadingFile.file)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
