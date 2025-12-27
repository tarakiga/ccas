'use client'

import { useState } from 'react'
import { Card, Badge, Button, Select } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface Task {
  id: string
  shipmentNumber: string
  stepName: string
  department: string
  targetDate: string
  daysUntilDue: number
  priority: 'high' | 'medium' | 'low'
  principal: string
}

export function MyTasksView() {
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')

  // Mock tasks - would come from API
  const tasks: Task[] = [
    {
      id: '1',
      shipmentNumber: 'SH-003',
      stepName: 'Bayan Submission',
      department: 'Customs & Clearance',
      targetDate: '2025-01-23',
      daysUntilDue: 1,
      priority: 'high',
      principal: 'Toyota',
    },
    {
      id: '2',
      shipmentNumber: 'SH-007',
      stepName: 'Document Verification',
      department: 'Business Unit',
      targetDate: '2025-01-24',
      daysUntilDue: 2,
      priority: 'high',
      principal: 'Honda',
    },
    {
      id: '3',
      shipmentNumber: 'SH-012',
      stepName: 'LC Opening',
      department: 'Finance',
      targetDate: '2025-01-26',
      daysUntilDue: 4,
      priority: 'medium',
      principal: 'Nissan',
    },
  ]

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="error">High Priority</Badge>
      case 'medium':
        return <Badge variant="warning">Medium Priority</Badge>
      case 'low':
        return <Badge variant="info">Low Priority</Badge>
      default:
        return <Badge variant="default">{priority}</Badge>
    }
  }

  const getDaysColor = (days: number) => {
    if (days <= 1) return 'text-red-600'
    if (days <= 3) return 'text-orange-600'
    return 'text-gray-900'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        <p className="mt-2 text-gray-600">
          Workflow steps assigned to you
        </p>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Departments' },
                { value: 'business_unit', label: 'Business Unit' },
                { value: 'finance', label: 'Finance' },
                { value: 'customs', label: 'Customs & Clearance' },
              ]}
            />
          </div>
          <div className="flex-1">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'dueDate', label: 'Sort by Due Date' },
                { value: 'priority', label: 'Sort by Priority' },
                { value: 'shipment', label: 'Sort by Shipment' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Urgent (Due Today)</p>
              <p className="mt-1 text-3xl font-bold text-red-600">2</p>
            </div>
            <svg className="h-12 w-12 text-red-200" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
        </Card>
        <Card className="bg-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Due This Week</p>
              <p className="mt-1 text-3xl font-bold text-orange-600">5</p>
            </div>
            <svg className="h-12 w-12 text-orange-200" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
        </Card>
        <Card className="bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Today</p>
              <p className="mt-1 text-3xl font-bold text-green-600">3</p>
            </div>
            <svg className="h-12 w-12 text-green-200" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </Card>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/shipments/${task.id}`}
                    className="text-lg font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    {task.shipmentNumber}
                  </Link>
                  {getPriorityBadge(task.priority)}
                </div>
                <p className="mt-1 text-gray-900">{task.stepName}</p>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                    {task.department}
                  </span>
                  <span>📦 {task.principal}</span>
                  <span>📅 Due: {formatDate(task.targetDate)}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Due in</p>
                  <p className={`text-2xl font-bold ${getDaysColor(task.daysUntilDue)}`}>
                    {task.daysUntilDue}d
                  </p>
                </div>
                <Button size="sm">
                  Complete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
