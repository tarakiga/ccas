'use client'

interface DataPoint {
  label: string
  value: number
  color: string
}

interface PieChartProps {
  data: DataPoint[]
  size?: number
  showLegend?: boolean
}

export function PieChart({ data, size = 200, showLegend = true }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  
  let currentAngle = -90 // Start from top

  const slices = data.map((item) => {
    const percentage = (item.value / total) * 100
    const angle = (item.value / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle

    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    // Calculate arc path
    const x1 = 50 + 40 * Math.cos(startRad)
    const y1 = 50 + 40 * Math.sin(startRad)
    const x2 = 50 + 40 * Math.cos(endRad)
    const y2 = 50 + 40 * Math.sin(endRad)

    const largeArc = angle > 180 ? 1 : 0

    const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`

    currentAngle = endAngle

    return {
      ...item,
      path,
      percentage: percentage.toFixed(1),
    }
  })

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox="0 0 100 100">
        {slices.map((slice, index) => (
          <g key={index}>
            <path
              d={slice.path}
              fill={slice.color}
              className="transition-opacity hover:opacity-80"
            />
          </g>
        ))}
        {/* Center circle for donut effect */}
        <circle cx="50" cy="50" r="25" fill="white" />
      </svg>

      {showLegend && (
        <div className="grid grid-cols-2 gap-3">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <div className="text-sm">
                <span className="font-medium text-gray-700">{slice.label}</span>
                <span className="ml-1 text-gray-500">({slice.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
