'use client'

import { useState, useEffect } from 'react'
import { FileText, Search, Filter, Download, Eye, Trash2, RefreshCw, MoreHorizontal } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FileUpload } from '@/components/documents/file-upload'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n/use-translation'

interface Document {
  id: string
  file_name: string
  file_type: string
  file_size: number
  status: string
  document_type?: string
  confidence?: number
  extracted_data?: any
  created_at: string
  project?: {
    title: string
  }
  client?: {
    full_name: string
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function DocumentsPage() {
  const { t, locale } = useTranslation()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  async function fetchDocuments() {
    try {
      const res = await fetch('/api/documents')
      if (res.ok) {
        const data = await res.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function reprocessDocument(id: string) {
    try {
      const res = await fetch(`/api/documents/${id}/reprocess`, { method: 'POST' })
      if (res.ok) {
        toast.success(t('documents.reprocessSuccess'))
        fetchDocuments()
      }
    } catch (error) {
      toast.error(t('documents.reprocessError'))
    }
  }

  const filteredDocuments = documents.filter(d =>
    d.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.document_type?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statusColors: Record<string, string> = {
    uploaded: 'secondary',
    processing: 'warning',
    processed: 'success',
    verified: 'default',
    error: 'destructive',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('documents.title')}</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            {t('documents.subtitle')}
          </p>
        </div>
        <Button onClick={() => setShowUpload(!showUpload)} className="bg-indigo-600 hover:bg-indigo-700">
          <FileText className="h-4 w-4 mr-2" />
          {showUpload ? t('documents.hide') : t('documents.upload')}
        </Button>
      </div>

      {/* Upload Area */}
      {showUpload && (
        <FileUpload onUploadComplete={() => {
          setShowUpload(false)
          fetchDocuments()
        }} />
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            placeholder={t('documents.search')}
            className="pl-10 bg-white/5 border-white/10 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
          <Filter className="h-4 w-4 mr-2" />
          {t('projects.filters')}
        </Button>
      </div>

      {/* Documents List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded bg-white/10"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-white/10 rounded w-1/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="glass-card hover:border-indigo-500/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-indigo-400" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white truncate">
                        {doc.file_name}
                      </h3>
                      <Badge variant={statusColors[doc.status] as any || 'outline'} className="uppercase text-[10px]">
                        {t(`documents.${doc.status}`) || doc.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>•</span>
                      <span>{new Date(doc.created_at).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US')}</span>
                      {doc.document_type && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{doc.document_type}</span>
                        </>
                      )}
                      {doc.confidence && (
                        <>
                          <span>•</span>
                          <span className={doc.confidence > 0.8 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                            {(doc.confidence * 100).toFixed(0)}% {t('documents.confidence')}
                          </span>
                        </>
                      )}
                      {doc.client && (
                        <>
                          <span>•</span>
                          <span className="text-white font-medium">{doc.client.full_name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {doc.status === 'error' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                        onClick={() => reprocessDocument(doc.id)}
                        title={t('documents.reprocess')}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                      <Download className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1a1d2e] border-white/10 text-white">
                        <DropdownMenuItem className="text-red-400 hover:bg-red-400/10 cursor-pointer">
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredDocuments.length === 0 && (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-white mb-2">
                  {t('documents.noDocuments')}
                </h3>
                <Button onClick={() => setShowUpload(true)} className="bg-indigo-600 hover:bg-indigo-700 mt-4">
                  <FileText className="h-4 w-4 mr-2" />
                  {t('documents.upload')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
