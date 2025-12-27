'use client'

import { useMemo } from 'react'

interface DataPoint {
  label: string
  value: number
}

interface LineChartProps {
  data: DataPoint[]
  height?: number
  color?: string
  showGrid?: boolean
  showLabels?: boolean
}

export function LineChart({
  data,
  height = 200,
  color = '#0066FF',
  showGrid = true,
  showLabels = true,
}: LineChartProps) {
  const { points, maxValue, minValue } = useMemo(() => {
    const values = data.map((d) => d.value)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1

    const pts = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100
      const y = 100 - ((d.value - min) / range) * 100
      return `${x},${y}`
    })

    return { points: pts.join(' '), maxValue: max, minValue: min }
  }, [data])

  return (
    <div className="relative" style={{ height }}>
      <svg
        className="h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        {showGrid && (
          <g className="opacity-20">
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="currentColor"
                strokeWidth="0.2"
                className="text-gray-400"
              />
            ))}
          </g>
        )}

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Area under line */}
        <polygon
          points={`0,100 ${points} 100,100`}
          fill={color}
          opacity="0.1"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100
          const y = 100 - ((d.value - minValue) / (maxValue - minValue || 1)) * 100
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1.5"
              fill={color}
              vectorEffect="non-scaling-stroke"
              className="transition-all hover:r-2"
            />
          )
        })}
      </svg>

      {/* Labels */}
      {showLabels && (
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          {data.map((d, i) => (
            <span key={i}>{d.label}</span>
          ))}
        </div>
      )}
    </div>
  )
}
