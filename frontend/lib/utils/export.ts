/**
 * Export utility functions for CSV and Excel
 */

import { Shipment } from '@/types'

/**
 * Convert array of objects to CSV string
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  columns?: { key: keyof T; label: string }[]
): string {
  if (data.length === 0) return ''

  // If columns not specified, use all keys from first object
  const cols = columns || Object.keys(data[0]).map((key) => ({ key, label: key }))

  // Create header row
  const header = cols.map((col) => col.label).join(',')

  // Create data rows
  const rows = data.map((item) => {
    return cols
      .map((col) => {
        const value = item[col.key]
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value ?? ''
      })
      .join(',')
  })

  return [header, ...rows].join('\n')
}

/**
 * Download CSV file
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Export shipments to CSV
 */
export function exportShipmentsToCSV(shipments: Shipment[], filename?: string): void {
  const columns = [
    { key: 'shipmentNumber' as keyof Shipment, label: 'Shipment #' },
    { key: 'principal' as keyof Shipment, label: 'Principal' },
    { key: 'brand' as keyof Shipment, label: 'Brand' },
    { key: 'lcNumber' as keyof Shipment, label: 'LC Number' },
    { key: 'eta' as keyof Shipment, label: 'ETA' },
    { key: 'status' as keyof Shipment, label: 'Status' },
    { key: 'daysPostEta' as keyof Shipment, label: 'Days Post-ETA' },
    { key: 'riskLevel' as keyof Shipment, label: 'Risk Level' },
    { key: 'currentStep' as keyof Shipment, label: 'Current Step' },
  ]

  const csv = convertToCSV(shipments, columns)
  const name = filename || `shipments-${new Date().toISOString().split('T')[0]}.csv`

  downloadCSV(csv, name)
}

/**
 * Copy data to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    return false
  }
}

/**
 * Format data for Excel (tab-separated values)
 */
export function convertToTSV<T extends Record<string, any>>(
  data: T[],
  columns?: { key: keyof T; label: string }[]
): string {
  if (data.length === 0) return ''

  const cols = columns || Object.keys(data[0]).map((key) => ({ key, label: key }))

  // Create header row
  const header = cols.map((col) => col.label).join('\t')

  // Create data rows
  const rows = data.map((item) => {
    return cols
      .map((col) => {
        const value = item[col.key]
        return value ?? ''
      })
      .join('\t')
  })

  return [header, ...rows].join('\n')
}

/**
 * Download Excel file (TSV format)
 */
export function downloadExcel(tsv: string, filename: string): void {
  const blob = new Blob([tsv], { type: 'application/vnd.ms-excel' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
