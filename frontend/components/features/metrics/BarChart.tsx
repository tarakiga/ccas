'use client'

interface DataPoint {
  label: string
  value: number
  color?: string
}

interface BarChartProps {
  data: DataPoint[]
  height?: number
  showValues?: boolean
}

export function BarChart({ data, height: _height = 300, showValues = true }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100

        return (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{item.label}</span>
              {showValues && (
                <span className="text-gray-900">{item.value}</span>
              )}
            </div>
            <div className="h-8 w-full overflow-hidden rounded-lg bg-gray-100">
              <div
                className="h-full rounded-lg transition-all duration-500 ease-out"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color || '#0066FF',
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
