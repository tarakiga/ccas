'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface Change {
  field: string
  before: string | number | boolean | null
  after: string | number | boolean | null
}

interface DiffViewerProps {
  changes: Change[]
  viewMode?: 'inline' | 'side-by-side'
}

export function DiffViewer({ changes, viewMode: initialViewMode = 'inline' }: DiffViewerProps) {
  const [viewMode, setViewMode] = useState<'inline' | 'side-by-side'>(initialViewMode)

  const formatValue = (value: string | number | boolean | null): string => {
    if (value === null || value === undefined || value === '') return '(empty)'
    if (typeof value === 'boolean') return value ? 'true' : 'false'
    return String(value)
  }

  const getChangeType = (change: Change): 'added' | 'removed' | 'modified' => {
    if (!change.before || change.before === '') return 'added'
    if (!change.after || change.after === '') return 'removed'
    return 'modified'
  }

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900">Field Changes</h4>
        <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setViewMode('inline')}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              viewMode === 'inline'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Inline
          </button>
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              viewMode === 'side-by-side'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Side by Side
          </button>
        </div>
      </div>

      {/* Changes Display */}
      <div className="space-y-3">
        {changes.map((change, idx) => {
          const changeType = getChangeType(change)
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              {viewMode === 'inline' ? (
                <InlineView change={change} changeType={changeType} formatValue={formatValue} />
              ) : (
                <SideBySideView change={change} changeType={changeType} formatValue={formatValue} />
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

interface ViewProps {
  change: Change
  changeType: 'added' | 'removed' | 'modified'
  formatValue: (value: string | number | boolean | null) => string
}

function InlineView({ change, changeType, formatValue }: ViewProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="font-medium text-gray-900">{change.field}</span>
        <ChangeTypeBadge type={changeType} />
      </div>
      
      <div className="space-y-2">
        {changeType !== 'added' && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-500 w-16">Before:</span>
            <div className="flex-1 rounded bg-red-50 border border-red-200 px-3 py-2">
              <span className="text-sm text-red-700 line-through">
                {formatValue(change.before)}
              </span>
            </div>
          </div>
        )}
        
        {changeType !== 'removed' && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-500 w-16">After:</span>
            <div className="flex-1 rounded bg-green-50 border border-green-200 px-3 py-2">
              <span className="text-sm text-green-700 font-medium">
                {formatValue(change.after)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SideBySideView({ change, changeType, formatValue }: ViewProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
        <span className="font-medium text-gray-900">{change.field}</span>
        <ChangeTypeBadge type={changeType} />
      </div>
      
      <div className="grid grid-cols-2 divide-x divide-gray-200">
        {/* Before Column */}
        <div className={`p-4 ${changeType === 'added' ? 'bg-gray-50' : 'bg-red-50'}`}>
          <div className="mb-2 text-xs font-semibold text-gray-600 uppercase">Before</div>
          {changeType === 'added' ? (
            <div className="text-sm text-gray-400 italic">No previous value</div>
          ) : (
            <div className="text-sm text-red-700">
              <HighlightedText
                text={formatValue(change.before)}
                compareText={formatValue(change.after)}
                type="removed"
              />
            </div>
          )}
        </div>
        
        {/* After Column */}
        <div className={`p-4 ${changeType === 'removed' ? 'bg-gray-50' : 'bg-green-50'}`}>
          <div className="mb-2 text-xs font-semibold text-gray-600 uppercase">After</div>
          {changeType === 'removed' ? (
            <div className="text-sm text-gray-400 italic">Value removed</div>
          ) : (
            <div className="text-sm text-green-700 font-medium">
              <HighlightedText
                text={formatValue(change.after)}
                compareText={formatValue(change.before)}
                type="added"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ChangeTypeBadge({ type }: { type: 'added' | 'removed' | 'modified' }) {
  const styles = {
    added: 'bg-green-100 text-green-700 border-green-200',
    removed: 'bg-red-100 text-red-700 border-red-200',
    modified: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  }

  const icons = {
    added: '+',
    removed: '-',
    modified: '~',
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${styles[type]}`}>
      <span className="font-bold">{icons[type]}</span>
      {type}
    </span>
  )
}

interface HighlightedTextProps {
  text: string
  compareText: string
  type: 'added' | 'removed'
}

function HighlightedText({ text, compareText, type }: HighlightedTextProps) {
  // Simple character-level diff highlighting
  const highlightDifferences = () => {
    if (text === compareText) return <span>{text}</span>

    const textChars = text.split('')
    const compareChars = compareText.split('')
    const maxLength = Math.max(textChars.length, compareChars.length)

    const result: JSX.Element[] = []
    let currentSegment = ''
    let isDifferent = false

    for (let i = 0; i < maxLength; i++) {
      const char = textChars[i] || ''
      const compareChar = compareChars[i] || ''
      const charIsDifferent = char !== compareChar

      if (charIsDifferent !== isDifferent) {
        // Segment boundary - flush current segment
        if (currentSegment) {
          result.push(
            isDifferent ? (
              <mark
                key={i}
                className={`${
                  type === 'added' ? 'bg-green-200' : 'bg-red-200'
                } px-0.5 rounded`}
              >
                {currentSegment}
              </mark>
            ) : (
              <span key={i}>{currentSegment}</span>
            )
          )
        }
        currentSegment = char
        isDifferent = charIsDifferent
      } else {
        currentSegment += char
      }
    }

    // Flush remaining segment
    if (currentSegment) {
      result.push(
        isDifferent ? (
          <mark
            key="last"
            className={`${
              type === 'added' ? 'bg-green-200' : 'bg-red-200'
            } px-0.5 rounded`}
          >
            {currentSegment}
          </mark>
        ) : (
          <span key="last">{currentSegment}</span>
        )
      )
    }

    return <>{result}</>
  }

  return <div className="break-words">{highlightDifferences()}</div>
}
