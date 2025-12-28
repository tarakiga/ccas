'use client'

import { useState, useMemo } from 'react'
import { Card, Badge, Button, Modal, StatCard } from '@/components/ui'
import { formatDate } from '@/lib/utils/date'
import { getMockWorkflowSteps, completeMockWorkflowStep } from '@/lib/mocks/workflow'
import { getDepartmentColor, Department } from '@/lib/workflow/definitions'
import type { WorkflowStep } from '@/lib/workflow/types'
import { motion, AnimatePresence } from 'framer-motion'
import { FadeIn, StaggerChildren } from '@/components/animations'

interface WorkflowTimelineProps {
  shipmentId: string
}

// Custom Icons for Departments
const DeptIcons = {
  'Business Unit': () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  'Finance': () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'C&C': () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  'Business Unit - Stores': () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
}

export function WorkflowTimeline({ shipmentId }: WorkflowTimelineProps) {
  const [steps, setSteps] = useState<WorkflowStep[]>(() => getMockWorkflowSteps(shipmentId))
  const [expandedStep, setExpandedStep] = useState<string | null>(null)
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [filterDepartment, setFilterDepartment] = useState<Department | 'all'>('all')

  // Calculate progress
  const progress = useMemo(() => {
    const total = steps.length
    const completed = steps.filter((s) => s.status === 'completed').length
    const overdue = steps.filter((s) => s.status === 'overdue').length
    const percentage = Math.round((completed / total) * 100)

    return { total, completed, overdue, percentage }
  }, [steps])

  // Group steps by department
  const groupedSteps = useMemo(() => {
    const filtered = filterDepartment === 'all'
      ? steps
      : steps.filter((s) => s.department === filterDepartment)

    return filtered.reduce((acc, step) => {
      if (!acc[step.department]) {
        acc[step.department] = []
      }
      acc[step.department].push(step)
      return acc
    }, {} as Record<Department, WorkflowStep[]>)
  }, [steps, filterDepartment])

  // Department progress
  const departmentProgress = useMemo(() => {
    const departments = Array.from(new Set(steps.map(s => s.department)))
    return departments.map((dept) => {
      const deptSteps = steps.filter((s) => s.department === dept)
      const completed = deptSteps.filter((s) => s.status === 'completed').length
      return {
        department: dept,
        total: deptSteps.length,
        completed,
        percentage: Math.round((completed / deptSteps.length) * 100),
      }
    }).sort((a, b) => a.department.localeCompare(b.department))
  }, [steps])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
      case 'in_progress': return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
      case 'ready': return 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.4)]'
      case 'overdue': return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
      case 'blocked': return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
      default: return 'bg-gray-300'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="success" className="rounded-full px-3">Completed</Badge>
      case 'in_progress': return <Badge variant="info" className="rounded-full px-3">In Progress</Badge>
      case 'ready': return <Badge variant="info" className="rounded-full px-3">Ready</Badge>
      case 'overdue': return <Badge variant="error" className="rounded-full px-3">Overdue</Badge>
      case 'blocked': return <Badge variant="warning" className="rounded-full px-3">Blocked</Badge>
      default: return <Badge variant="default" className="rounded-full px-3">Pending</Badge>
    }
  }

  const getDepartmentBadgeColor = (department: Department) => {
    const color = getDepartmentColor(department)
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
      green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
      purple: 'bg-purple-50 text-purple-700 ring-1 ring-purple-100',
    }
    return colorMap[color] || 'bg-gray-50 text-gray-700 ring-1 ring-gray-100'
  }

  const toggleExpand = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId)
  }

  const handleCompleteStep = (step: WorkflowStep) => {
    setSelectedStep(step)
    setShowCompleteModal(true)
  }

  const handleConfirmComplete = async () => {
    if (!selectedStep) return

    try {
      const updatedStep = await completeMockWorkflowStep(selectedStep.id, {
        actualDate: new Date().toISOString(),
        notes: 'Completed via workflow timeline',
      })

      setSteps((prev) =>
        prev.map((s) => (s.id === updatedStep.id ? updatedStep : s))
      )

      setShowCompleteModal(false)
      setSelectedStep(null)
    } catch (error) {
      alert('Failed to complete step')
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Progress Overview Section */}
      <FadeIn>
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-gray-900">Workflow Execution</h3>
              <p className="text-sm text-gray-500">Track and manage operational milestones</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-primary-600">{progress.percentage}%</span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Overall Progress</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Completed"
              value={progress.completed}
              className="border-none bg-emerald-50 shadow-sm ring-1 ring-emerald-100"
              animate
            />
            <StatCard
              title="Pending"
              value={progress.total - progress.completed}
              className="border-none bg-blue-50 shadow-sm ring-1 ring-blue-100"
              animate
            />
            <StatCard
              title="Overdue"
              value={progress.overdue}
              className={`border-none ${progress.overdue > 0 ? 'bg-rose-50 ring-rose-100' : 'bg-gray-50 ring-gray-100'}`}
              animate
            />
            <Card className="flex flex-col justify-center border-none bg-gray-900 p-6 text-white shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Operational Health</p>
              <p className="mt-2 text-2xl font-bold">{progress.overdue === 0 ? 'Optimal' : 'Needs Attention'}</p>
            </Card>
          </div>

          {/* Multi-department Progress Bar */}
          <div className="mt-8 overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Departmental Synchronicity</h4>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {departmentProgress.map((dept) => (
                <div key={dept.department} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">{dept.department}</span>
                    <span className="text-xs font-black text-primary-600">{dept.percentage}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dept.percentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-primary-500 shadow-sm"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400">{dept.completed} of {dept.total} steps</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterDepartment('all')}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${filterDepartment === 'all'
              ? 'bg-primary-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
          >
            All Units
          </button>
          {departmentProgress.map((dp) => (
            <button
              key={dp.department}
              onClick={() => setFilterDepartment(dp.department)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${filterDepartment === dp.department
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
            >
              {dp.department}
            </button>
          ))}
        </div>
        <div className="text-xs font-bold text-gray-400">
          Sorted by operational sequence
        </div>
      </div>

      {/* Timeline Section */}
      <div className="relative px-2">
        {/* Main Vertical Track */}
        <div className="absolute left-[48px] top-0 bottom-0 w-[2px] -ml-[1px] bg-gradient-to-b from-primary-200 via-gray-100 to-transparent" />

        <StaggerChildren className="space-y-12">
          {Object.entries(groupedSteps).map(([department, deptSteps]) => (
            <div key={department} className="relative">
              {/* Department Group Header */}
              <div className="mb-8 flex items-center gap-6">
                <div className="relative z-10 ml-[10px] flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-white shadow-xl ring-4 ring-gray-50 transition-transform hover:scale-105">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    {DeptIcons[department as keyof typeof DeptIcons] ? DeptIcons[department as keyof typeof DeptIcons]() : <DeptIcons.Finance />}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-black tracking-tight text-gray-900">{department}</h4>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {deptSteps.filter((s) => s.status === 'completed').length} / {deptSteps.length} Milestones Reached
                    </p>
                  </div>
                </div>
              </div>

              {/* Steps in Department */}
              <div className="ml-[40px] space-y-6 border-l-2 border-dashed border-gray-100 pl-[40px]">
                {deptSteps.map((step) => {
                  const isExpanded = expandedStep === step.id
                  const isActionable = step.status === 'in_progress' || step.status === 'ready'

                  return (
                    <motion.div
                      key={step.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="relative"
                    >
                      {/* Step Dot Connector */}
                      <div className="absolute -left-[60px] top-6 z-20 flex h-10 w-10 items-center justify-center">
                        <div className={`h-4 w-4 rounded-full border-4 border-white transition-all ${getStatusColor(step.status)} ${isExpanded ? 'scale-150' : ''}`} />
                      </div>

                      {/* Step Card */}
                      <Card className={`group relative border-none bg-white transition-all duration-300 hover:shadow-2xl ring-1 ${isExpanded ? 'ring-primary-300 shadow-xl' : 'ring-gray-100 shadow-sm'}`}>
                        <div
                          className="cursor-pointer p-6"
                          onClick={() => toggleExpand(step.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="flex h-6 w-6 items-center justify-center rounded bg-gray-900 text-[10px] font-black text-white">
                                  {step.stepNumber}
                                </span>
                                <h4 className={`text-base font-bold tracking-tight transition-colors ${isExpanded ? 'text-primary-600' : 'text-gray-900'}`}>
                                  {step.name}
                                </h4>
                                {getStatusBadge(step.status)}
                                {step.isCritical && (
                                  <div className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-black text-rose-600 ring-1 ring-rose-100">
                                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    CRITICAL
                                  </div>
                                )}
                              </div>
                              <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">
                                {step.description}
                              </p>

                              <div className="mt-4 flex flex-wrap items-center gap-4">
                                <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest ${getDepartmentBadgeColor(step.department)}`}>
                                  {step.department}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                  <span className="h-4 w-4 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-[8px] text-gray-600 uppercase">P</span>
                                  {step.ppr}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                  <span className="h-4 w-4 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-[8px] text-gray-600 uppercase">A</span>
                                  {step.apr}
                                </div>
                              </div>
                            </div>

                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              className="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </motion.div>
                          </div>

                          {/* Date Indicators */}
                          <div className="mt-6 flex gap-8 border-t border-gray-50 pt-4">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Delivery</p>
                              <p className="mt-1 text-sm font-bold text-gray-900">{formatDate(step.targetDate)}</p>
                            </div>
                            {step.actualDate && (
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Actual Fulfillment</p>
                                <p className="mt-1 text-sm font-bold text-emerald-600">{formatDate(step.actualDate)}</p>
                              </div>
                            )}
                            {step.status === 'overdue' && (
                              <div className="animate-pulse">
                                <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Time Variance</p>
                                <p className="mt-1 text-sm font-black text-rose-600">SLAs EXCEEDED</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expanded Detail View */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-gray-50 px-6 pb-6"
                            >
                              <div className="grid gap-6 border-t border-gray-100 pt-6 lg:grid-cols-2">
                                <div className="space-y-4">
                                  <div>
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Operational Logic</h5>
                                    <p className="mt-1 text-sm font-medium text-gray-600 leading-relaxed">{step.explanation}</p>
                                  </div>
                                  {step.blockedBy && step.blockedBy.length > 0 && (
                                    <div className="rounded-lg bg-amber-50 p-3 ring-1 ring-amber-100">
                                      <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-600">Prerequisites Required</h5>
                                      <p className="mt-1 text-sm font-bold text-amber-800">
                                        Must fulfill milestone(s): {step.blockedBy.join(', ')}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-4">
                                  {step.notes && (
                                    <div>
                                      <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Official Annotations</h5>
                                      <p className="mt-1 text-sm font-medium text-gray-600 italic">"{step.notes}"</p>
                                    </div>
                                  )}
                                  {isActionable && !step.isBlocked && (
                                    <div className="flex gap-3 pt-2">
                                      <Button size="sm" onClick={() => handleCompleteStep(step)} className="shadow-lg">
                                        Fulfill Milestone
                                      </Button>
                                      <Button size="sm" variant="outline" className="bg-white">
                                        Add Annotation
                                      </Button>
                                    </div>
                                  )}
                                  {step.isBlocked && (
                                    <div className="flex items-center gap-2 rounded-lg bg-gray-200 p-3 text-gray-600 shadow-inner">
                                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                      <span className="text-xs font-black uppercase tracking-widest">Workflow Cascaded (Locked)</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </StaggerChildren>
      </div>

      {/* Modern Completion Dialog */}
      <Modal
        open={showCompleteModal}
        onClose={() => {
          setShowCompleteModal(false)
          setSelectedStep(null)
        }}
        title={`Authorize Milestone ${selectedStep?.stepNumber}`}
      >
        {selectedStep && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-primary-50 p-6 ring-1 ring-primary-100">
              <h4 className="text-lg font-black tracking-tight text-primary-900">{selectedStep.name}</h4>
              <p className="mt-2 text-sm font-medium leading-relaxed text-primary-700">{selectedStep.description}</p>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Operational Confirmation</p>
                <p className="text-xs text-gray-500">By authorizing this milestone, you verify that all prerequisites and physical checks have been satisfied.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setShowCompleteModal(false)
                  setSelectedStep(null)
                }}
              >
                Recall
              </Button>
              <Button onClick={handleConfirmComplete} className="rounded-full shadow-xl">
                Confirm Milestone
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
