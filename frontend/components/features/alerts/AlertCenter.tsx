'use client'

import React from 'react'

interface AlertCenterProps {
    className?: string
}

/**
 * Alert Center Component
 * Displays system alerts and notifications
 */
export default function AlertCenter({ className }: AlertCenterProps) {
    return (
        <div className={className}>
            <div className="p-4 text-center text-gray-500">
                Alert Center - Coming Soon
            </div>
        </div>
    )
}