'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EnhancedDashboard } from '@/components/ui/enhanced-dashboard'

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen">
      <EnhancedDashboard />
    </div>
  )
}
