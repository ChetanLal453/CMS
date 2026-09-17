'use client'

import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: ReactNode
  valueColor?: string
  chips?: ReactNode
}

export default function MetricCard({ label, value, valueColor, chips }: MetricCardProps) {
  return (
    <div className="kpi">
      <div className="kpi-l">{label}</div>
      <div className="kpi-v" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </div>
      {chips ? <div className="kpi-ch">{chips}</div> : null}
    </div>
  )
}
