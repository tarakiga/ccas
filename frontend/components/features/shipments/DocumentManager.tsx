'use client'

import { useState, useRef } from 'react'
import { Card, Button, Badge, Loading, Toast } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { useDocuments, useUploadDocument } from '@/lib/api/hooks/useDocuments'
// import type { Document } from '@/lib/mocks/documents'

interface DocumentManagerProps {
  shipmentId: string
}

export function DocumentManager({ shipmentId }: DocumentManagerProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedDocumentType, setSelectedDocumentType] = useState('')
  const [canSubmitToFinance, setCanSubmitToFinance] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch documents from API
  const { data: documents = [], isLoading } = useDocuments(shipmentId)
  const uploadMutation = useUploadDocument(shipmentId)
  
  // Document types for workflow steps 2.1-2.5
  const documentTypes = [
    { value: 'commercial-invoice', label: 'Commercial Invoice (Step 2.1)', step: '2.1' },
    { value: 'packing-list', label: 'Packing List (Step 2.2)', step: '2.2' },
    { value: 'bill-of-lading', label: 'Bill of Lading (Step 2.3)', step: '2.3' },
    { value: 'certificate-of-origin', label: 'Certificate of Origin (Step 2.4)', step: '2.4' },
    { value: 'insurance-certificate', label: 'Insurance Certificate (Step 2.5)', step: '2.5' },
    { value: 'lc-copy', label: 'LC Copy (Step 3.3)', step: '3.3' },
    { value: 'original-documents', label: 'Original Documents (Step 6.2)', step: '6.2' },
    { value: 'other', label: 'Other Document', step: null },
  ]
  
  // Check if all required documents (2.1-2.5) are uploaded
  const checkCanSubmitToFinance = () => {
    const requiredTypes = ['commercial-invoice', 'packing-list', 'bill-of-lading', 'certificate-of-origin', 'insurance-certificate']
    const uploadedTypes = documents.map(doc => doc.type?.toLowerCase())
    const allUploaded = requiredTypes.every(type => uploadedTypes.includes(type))
    setCanSubmitToFinance(allUploaded)
  }
  
  // Update check when documents change
  useState(() => {
    checkCanSubmitToFinance()
  })

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = async (files: FileList) => {
    if (!selectedDocumentType) {
      setToast({ message: 'Please select a document type first', type: 'error' })
      return
    }
    
    setUploading(true)
    
    try {
      const completedSteps: string[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          setToast({ message: `${file.name} is too large (max 10MB)`, type: 'error' })
          continue
        }
        
        // Upload with document type
        // Note: In real implementation, pass documentType as metadata
        await uploadMutation.mutateAsync(file)
        
        // Get auto-completed step
        const { autoCompleteOnDocumentUpload } = await import('@/lib/workflow/workflow-automation')
        const steps = autoCompleteOnDocumentUpload(selectedDocumentType, {})
        completedSteps.push(...steps)
      }
      
      // Show success message with completed steps
      const stepsMessage = completedSteps.length > 0 
        ? ` Workflow steps auto-completed: ${completedSteps.join(', ')}`
        : ''
      
      setToast({ 
        message: `Documents uploaded successfully!${stepsMessage}`, 
        type: 'success' 
      })
      
      // Reset document type selection
      setSelectedDocumentType('')
      
      // Check if can submit to finance
      checkCanSubmitToFinance()
    } catch (_error) {
      setToast({ message: 'Failed to upload documents', type: 'error' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return (
          <svg className="h-10 w-10 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
          </svg>
        )
      case 'excel':
        return (
          <svg className="h-10 w-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
          </svg>
        )
      default:
        return (
          <svg className="h-10 w-10 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
          </svg>
        )
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="success">Verified</Badge>
      case 'uploaded':
        return <Badge variant="info">Uploaded</Badge>
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" text="Loading documents..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          title={toast.type === 'success' ? 'Success' : 'Error'}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Upload Area */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Upload Document</h3>
        
        {/* Document Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedDocumentType}
            onChange={(e) => setSelectedDocumentType(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">Select document type...</option>
            {documentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Selecting a workflow step document will auto-complete that step when uploaded
          </p>
        </div>
        
        {/* Upload Area */}
        <div
          className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            dragActive ? 'border-primary-500 bg-primary-50' : 
            !selectedDocumentType ? 'border-gray-200 bg-gray-100' :
            'border-gray-300 bg-gray-50'
          } ${!selectedDocumentType ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDragEnter={selectedDocumentType ? handleDrag : undefined}
          onDragLeave={selectedDocumentType ? handleDrag : undefined}
          onDragOver={selectedDocumentType ? handleDrag : undefined}
          onDrop={selectedDocumentType ? handleDrop : undefined}
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            {selectedDocumentType ? (
              <>
                <span className="font-semibold text-primary-600">Click to upload</span> or drag and drop
              </>
            ) : (
              <span className="text-gray-400">Select a document type first</span>
            )}
          </p>
          <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX up to 10MB</p>
          <input
            ref={fileInputRef}
            type="file"
            className="absolute inset-0 cursor-pointer opacity-0"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFileInput}
            disabled={uploading || !selectedDocumentType}
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <Loading text="Uploading..." />
            </div>
          )}
        </div>
      </Card>

      {/* Document List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Documents ({documents.length})</h3>
          <Button size="sm" variant="outline">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download All
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">{getFileIcon(doc.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-500">{doc.size}</p>
                    </div>
                    {getStatusBadge(doc.status)}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    <p>Uploaded by {doc.uploadedBy}</p>
                    <p>{formatDate(doc.uploadedAt)}</p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="ghost">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Button>
                    <Button size="sm" variant="ghost">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </Button>
                    <Button size="sm" variant="ghost">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Document Checklist */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Required Documents</h3>
          {canSubmitToFinance && (
            <Badge variant="success">All Required Documents Uploaded</Badge>
          )}
        </div>
        
        <div className="space-y-2">
          {[
            { name: 'Commercial Invoice', type: 'commercial-invoice', step: '2.1', status: 'complete' },
            { name: 'Packing List', type: 'packing-list', step: '2.2', status: 'complete' },
            { name: 'Bill of Lading', type: 'bill-of-lading', step: '2.3', status: 'complete' },
            { name: 'Certificate of Origin', type: 'certificate-of-origin', step: '2.4', status: 'missing' },
            { name: 'Insurance Certificate', type: 'insurance-certificate', step: '2.5', status: 'missing' },
          ].map((item, index) => {
            const isUploaded = documents.some(doc => doc.type?.toLowerCase() === item.type)
            
            return (
              <div key={index} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-3">
                  {isUploaded ? (
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                    </svg>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    <span className="ml-2 text-xs text-gray-500">(Step {item.step})</span>
                  </div>
                </div>
                {!isUploaded && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedDocumentType(item.type)}
                  >
                    Upload
                  </Button>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Submit to Finance Button (Step 2.6) */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900">Submit to Finance (Step 2.6)</h4>
              <p className="mt-1 text-sm text-gray-600">
                Once all required documents are uploaded, submit them to the Finance department for LC processing.
              </p>
            </div>
            <Button
              disabled={!canSubmitToFinance}
              onClick={async () => {
                try {
                  // Simulate API call
                  await new Promise(resolve => setTimeout(resolve, 1000))
                  
                  // Auto-complete step 2.6
                  const { autoCompleteOnSubmission } = await import('@/lib/workflow/workflow-automation')
                  autoCompleteOnSubmission('documents-to-finance', {
                    allDocumentsUploaded: true
                  })
                  
                  setToast({ 
                    message: `Documents submitted to Finance! Step 2.6 completed.`, 
                    type: 'success' 
                  })
                } catch (error) {
                  setToast({ message: 'Failed to submit documents', type: 'error' })
                }
              }}
              className={canSubmitToFinance ? 'bg-gradient-to-r from-primary-600 to-primary-700' : ''}
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Submit to Finance
            </Button>
          </div>
          
          {!canSubmitToFinance && (
            <div className="mt-3 rounded-lg bg-yellow-50 p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ Please upload all required documents before submitting to Finance.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
