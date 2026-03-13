'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/config/api'

export interface Plan {
  id: string
  name: string
  slug: string
  priceCedis: number
  features: string[]
  order: number
}

interface PlansModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PlansModal({ isOpen, onClose }: PlansModalProps) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      apiClient
        .get<{ success: boolean; data: Plan[] }>(API_ENDPOINTS.PLANS)
        .then((res) => {
          if (res.data.success && res.data.data) setPlans(res.data.data)
        })
        .catch(() => setPlans([]))
        .finally(() => setLoading(false))
    }
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Plans & pricing" className="max-w-lg">
      <div className="space-y-4">
        <p className="text-white/70 text-sm">All prices in Ghana Cedis (GHS)</p>
        {loading ? (
          <div className="py-8 text-center text-white/60">Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="py-8 text-center text-white/60">No plans available yet.</div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="p-4 rounded-xl bg-background-tertiary border border-background-tertiary"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">{plan.name}</h3>
                  <span className="text-primary font-bold">
                    {plan.priceCedis === 0 ? 'Free' : `GHS ${plan.priceCedis}`}
                  </span>
                </div>
                {Array.isArray(plan.features) && plan.features.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm text-white/70">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-primary">•</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
