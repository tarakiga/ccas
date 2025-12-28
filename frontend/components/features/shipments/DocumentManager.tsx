'use client'

import { useState, useRef, useMemo } from 'react'
import { Card, Button, Badge, Loading, Toast } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { useDocuments, useUploadDocument } from '@/lib/api/hooks/useDocuments'
import { motion, AnimatePresence } from 'framer-motion'
import { FadeIn, StaggerChildren } from '@/components/animations'
import { cn } from '@/lib/utils'

interface DocumentManagerProps {
  shipmentId: string
}

const Icons = {
  PDF: () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 9h1m-1 4h1m-1 4h1m4-4h1m-1 4h1" />
    </svg>
  ),
  Excel: () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  File: () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  Upload: () => (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  Check: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Search: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Download: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Trash: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
}

export function DocumentManager({ shipmentId }: DocumentManagerProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedDocumentType, setSelectedDocumentType] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: documents = [], isLoading } = useDocuments(shipmentId)
  const uploadMutation = useUploadDocument(shipmentId)

  const documentTypes = useMemo(() => [
    { value: 'commercial-invoice', label: 'Commercial Invoice (Step 2.1)', step: '2.1' },
    { value: 'packing-list', label: 'Packing List (Step 2.2)', step: '2.2' },
    { value: 'bill-of-lading', label: 'Bill of Lading (Step 2.3)', step: '2.3' },
    { value: 'certificate-of-origin', label: 'Certificate of Origin (Step 2.4)', step: '2.4' },
    { value: 'insurance-certificate', label: 'Insurance Certificate (Step 2.5)', step: '2.5' },
    { value: 'lc-copy', label: 'LC Copy (Step 3.3)', step: '3.3' },
    { value: 'original-documents', label: 'Original Documents (Step 6.2)', step: '6.2' },
    { value: 'other', label: 'Other Document', step: null },
  ], [])

  const canSubmitToFinance = useMemo(() => {
    const requiredDocs = [
      ['commercial', 'invoice'],
      ['packing', 'list'],
      ['bill', 'lading'],
      ['origin', 'certificate'],
      ['insurance'],
    ]
    return requiredDocs.every(keywords =>
      documents.some(doc => {
        const docName = doc.name?.toLowerCase() || ''
        return keywords.some(kw => docName.includes(kw))
      })
    )
  }, [documents])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.length > 0) handleFiles(e.dataTransfer.files)
  }

  const handleFiles = async (files: FileList) => {
    if (!selectedDocumentType) {
      setToast({ message: 'Select a document type first', type: 'error' })
      return
    }
    setUploading(true)
    try {
      const completedSteps: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.size > 10 * 1024 * 1024) continue
        await uploadMutation.mutateAsync(file)
        const { autoCompleteOnDocumentUpload } = await import('@/lib/workflow/workflow-automation')
        const steps = autoCompleteOnDocumentUpload(selectedDocumentType, {})
        completedSteps.push(...steps)
      }
      setToast({
        message: `Successfully uploaded!${completedSteps.length > 0 ? ` Completed steps: ${completedSteps.join(', ')}` : ''}`,
        type: 'success'
      })
      setSelectedDocumentType('')
    } catch {
      setToast({ message: 'Failed to upload documents', type: 'error' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const getFileIcon = (type: string) => {
    const t = type.toLowerCase()
    if (t.includes('pdf')) return <Icons.PDF />
    if (t.includes('xls') || t.includes('csv')) return <Icons.Excel />
    return <Icons.File />
  }

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'verified') return <Badge variant="success" className="rounded-full px-3">Verified</Badge>
    if (s === 'uploaded') return <Badge variant="info" className="rounded-full px-3">Uploaded</Badge>
    if (s === 'pending') return <Badge variant="warning" className="rounded-full px-3">Pending</Badge>
    if (s === 'rejected') return <Badge variant="error" className="rounded-full px-3">Rejected</Badge>
    return <Badge variant="default" className="rounded-full px-3">{status}</Badge>
  }

  if (isLoading) return <div className="flex justify-center py-12"><Loading size="lg" text="Loading Dossier..." /></div>

  return (
    <div className="space-y-8 pb-12">
      {toast && (
        <Toast
          title={toast.type === 'success' ? 'Success' : 'Error'}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Upload Section */}
      <FadeIn>
        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-none bg-white p-6 shadow-xl ring-1 ring-gray-100">
            <div className="mb-6">
              <h3 className="text-xl font-bold tracking-tight text-gray-900">Document Intake</h3>
              <p className="text-sm text-gray-500">Upload and categorize shipment documentation</p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500">Document Type Assignment</label>
                <select
                  value={selectedDocumentType}
                  onChange={(e) => setSelectedDocumentType(e.target.value)}
                  className="block w-full rounded-xl border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold shadow-sm transition-all focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
                >
                  <option value="">Choose Category...</option>
                  {documentTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={cn(
                  "relative group overflow-hidden rounded-2xl border-2 border-dashed p-10 transition-all duration-300",
                  dragActive ? "border-primary-500 bg-primary-50 ring-4 ring-primary-100" : "border-gray-200 bg-gray-50 hover:border-gray-300",
                  !selectedDocumentType && "opacity-50 grayscale cursor-not-allowed"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="absolute inset-0 z-10 cursor-pointer opacity-0"
                  multiple
                  onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  disabled={uploading || !selectedDocumentType}
                />
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg transition-transform duration-300 group-hover:scale-110",
                    dragActive ? "text-primary-600 scale-110" : "text-gray-400"
                  )}>
                    <Icons.Upload />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-gray-900">
                      {selectedDocumentType ? "Drop documents here" : "Select type above to unlock"}
                    </p>
                    <p className="text-xs font-medium text-gray-500">Support for PDF, Excel, and Office (Max 10MB)</p>
                  </div>
                </div>
                {uploading && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm bg-white/60">
                    <Loading text="Processing..." />
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="border-none bg-gray-900 p-6 text-white shadow-xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary-400">Compliance Checklist</h3>
            <div className="mt-6 space-y-4">
              {[
                { name: 'Comm. Invoice', keywords: ['commercial', 'invoice'], step: '2.1' },
                { name: 'Packing List', keywords: ['packing', 'list'], step: '2.2' },
                { name: 'Bill of Lading', keywords: ['bill', 'lading', 'bol'], step: '2.3' },
                { name: 'Cert of Origin', keywords: ['origin', 'certificate'], step: '2.4' },
                { name: 'Insurance Cert', keywords: ['insurance'], step: '2.5' },
              ].map((item) => {
                // Check if any uploaded document name contains the keywords
                const isUploaded = documents.some(doc => {
                  const docName = doc.name?.toLowerCase() || ''
                  return item.keywords.some(keyword => docName.includes(keyword))
                })
                return (
                  <div key={item.step} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full transition-colors",
                        isUploaded ? "bg-emerald-500 text-white" : "bg-gray-800 text-gray-600 border border-gray-700"
                      )}>
                        {isUploaded && <Icons.Check />}
                      </div>
                      <span className={cn("text-xs font-bold", isUploaded ? "text-white" : "text-gray-500")}>{item.name}</span>
                    </div>
                    <span className="text-[10px] font-black tracking-tighter text-gray-600">S {item.step}</span>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 border-t border-gray-800 pt-6">
              <Button
                disabled={!canSubmitToFinance}
                onClick={async () => {
                  setUploading(true)
                  await new Promise(r => setTimeout(r, 1000))
                  const { autoCompleteOnSubmission } = await import('@/lib/workflow/workflow-automation')
                  autoCompleteOnSubmission('documents-to-finance', { allDocumentsUploaded: true })
                  setToast({ message: 'Submitted to Finance! Step 2.6 complete.', type: 'success' })
                  setUploading(false)
                }}
                className={cn(
                  "w-full py-6 transition-all",
                  canSubmitToFinance ? "bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20" : "bg-gray-800 text-gray-500"
                )}
              >
                Forward to Finance
              </Button>
              {!canSubmitToFinance && (
                <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-600">Pending required uploads</p>
              )}
            </div>
          </Card>
        </section>
      </FadeIn>

      {/* Document Explorer */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-gray-900">Digital Archive</h3>
            <p className="text-sm text-gray-500">Managed shipment documents ({documents.length})</p>
          </div>
          <Button variant="outline" className="rounded-xl border-gray-200 bg-white shadow-sm ring-1 ring-gray-100 hover:bg-gray-50">
            <Icons.Download />
            <span className="ml-2 font-bold">Export All</span>
          </Button>
        </div>

        <StaggerChildren className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <motion.div key={doc.id} whileHover={{ y: -4 }} className="group">
              <Card className="relative h-full overflow-hidden border-none bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-xl hover:ring-primary-100">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition-colors group-hover:bg-primary-50 group-hover:text-primary-600">
                    {getFileIcon(doc.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-black text-gray-900 group-hover:text-primary-700">{doc.name}</p>
                      {getStatusBadge(doc.status)}
                    </div>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">{doc.category || 'General Document'}</p>

                    <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
                      <div className="text-[10px] font-bold text-gray-500">
                        <p>{doc.size} • {formatDate(doc.uploadedAt)}</p>
                        <p className="mt-0.5">By {doc.uploadedBy}</p>
                      </div>
                      <div className="flex gap-1">
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-all hover:bg-primary-50 hover:text-primary-600">
                          <Icons.Search />
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-all hover:bg-primary-50 hover:text-primary-600">
                          <Icons.Download />
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-all hover:bg-rose-50 hover:text-rose-600">
                          <Icons.Trash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </StaggerChildren>
      </section>
    </div>
  )
}
