'use client'

import { useState } from 'react'
import { Card, Button, Input, Badge } from '@/components/ui'
import { FadeIn } from '@/components/animations'
import { DiffViewer } from '@/components/features/audit/DiffViewer'
import { formatDate } from '@/lib/utils'

interface AuditEntry {
  id: string
  user: string
  action: string
  entity: string
  entityId: string
  timestamp: string
  changes?: { field: string; before: string; after: string }[]
  ipAddress: string
}

export default function AuditPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAction, setFilterAction] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Mock data
  const auditLogs: AuditEntry[] = [
    {
      id: '1',
      user: 'John Doe',
      action: 'UPDATE',
      entity: 'Shipment',
      entityId: 'SH-001',
      timestamp: '2025-01-22T10:30:00Z',
      changes: [
        { field: 'status', before: 'in_progress', after: 'completed' },
        { field: 'completedDate', before: '', after: '2025-01-22' },
        { field: 'assignedTo', before: 'Jane Smith', after: 'John Doe' },
      ],
      ipAddress: '192.168.1.100',
    },
    {
      id: '2',
      user: 'Jane Smith',
      action: 'UPDATE',
      entity: 'Shipment',
      entityId: 'SH-007',
      timestamp: '2025-01-22T09:45:00Z',
      changes: [
        { field: 'eta', before: '2025-01-25', after: '2025-01-27' },
        { field: 'notes', before: 'Awaiting customs clearance', after: 'Awaiting customs clearance - delayed due to missing documents' },
        { field: 'priority', before: 'normal', after: 'high' },
      ],
      ipAddress: '192.168.1.101',
    },
    {
      id: '3',
      user: 'Mike Johnson',
      action: 'CREATE',
      entity: 'Shipment',
      entityId: 'SH-015',
      timestamp: '2025-01-22T09:15:00Z',
      ipAddress: '192.168.1.101',
    },
    {
      id: '4',
      user: 'Sarah Williams',
      action: 'UPDATE',
      entity: 'Document',
      entityId: 'DOC-123',
      timestamp: '2025-01-21T18:20:00Z',
      changes: [
        { field: 'status', before: 'pending', after: 'approved' },
        { field: 'approvedBy', before: '', after: 'Sarah Williams' },
        { field: 'approvalDate', before: '', after: '2025-01-21' },
      ],
      ipAddress: '192.168.1.103',
    },
    {
      id: '5',
      user: 'Mike Johnson',
      action: 'DELETE',
      entity: 'Document',
      entityId: 'DOC-045',
      timestamp: '2025-01-21T16:45:00Z',
      changes: [
        { field: 'fileName', before: 'invoice_draft.pdf', after: '' },
        { field: 'status', before: 'draft', after: '' },
      ],
      ipAddress: '192.168.1.102',
    },
    {
      id: '6',
      user: 'John Doe',
      action: 'UPDATE',
      entity: 'Workflow Step',
      entityId: 'WF-SH001-05',
      timestamp: '2025-01-21T14:30:00Z',
      changes: [
        { field: 'completedDate', before: '', after: '2025-01-21' },
        { field: 'status', before: 'pending', after: 'completed' },
        { field: 'actualDuration', before: '0', after: '3.5' },
      ],
      ipAddress: '192.168.1.100',
    },
  ]

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Badge variant="success">CREATE</Badge>
      case 'UPDATE':
        return <Badge variant="info">UPDATE</Badge>
      case 'DELETE':
        return <Badge variant="error">DELETE</Badge>
      default:
        return <Badge variant="default">{action}</Badge>
    }
  }

  return (
    <FadeIn>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Trail</h1>
            <p className="mt-2 text-gray-600">
              Complete history of system changes and user actions
            </p>
          </div>
          <Button variant="outline">
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex gap-4">
            <Input
              placeholder="Search by user, entity, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
            </select>
          </div>
        </Card>

        {/* Audit Log Timeline */}
        <div className="space-y-4">
          {auditLogs.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {getActionBadge(entry.action)}
                    <span className="font-medium text-gray-900">{entry.user}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-sm text-gray-600">
                      {entry.action.toLowerCase()}d {entry.entity} #{entry.entityId}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                    <span>{formatDate(entry.timestamp, 'long')}</span>
                    <span>•</span>
                    <span>IP: {entry.ipAddress}</span>
                  </div>

                  {/* Changes */}
                  {entry.changes && expandedId === entry.id && (
                    <div className="mt-4">
                      <DiffViewer changes={entry.changes} />
                    </div>
                  )}
                </div>

                {entry.changes && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  >
                    {expandedId === entry.id ? 'Hide' : 'Show'} Details
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </FadeIn>
  )
}
