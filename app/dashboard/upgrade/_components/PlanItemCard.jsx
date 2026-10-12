"use client";
import { useAuth } from '@/context/AuthContext'
import React from 'react'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

function PlanItemCard({ plan }) {
  const { user } = useAuth();
  const isPaid = plan.cost > 0;

  return (
    <div className={`plan-card relative rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between ${
        isPaid 
            ? 'bg-gradient-to-b from-primary/5 via-white to-primary/5 dark:from-gray-800 dark:to-gray-900 border-2 border-primary shadow-xl hover:-translate-y-2' 
            : 'bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-1'
    }`}>
      {isPaid && (
        <span className='absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-md'>
          <Sparkles className='w-3 h-3' /> Most Popular
        </span>
      )}

      <div>
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {plan.name}
          </h3>

          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
              ${plan.cost}
            </span>
            <span className="text-sm font-medium text-gray-500">/month</span>
          </div>
        </div>

        <ul className="space-y-3 mb-8">
          {plan.offering.map((item, index) => (
            <li key={index} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
              <span className='p-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0'>
                <Check className="w-3.5 h-3.5" />
              </span>
              <span>{item.value}</span>
            </li>
          ))}
        </ul>
      </div>

      <a
        href={plan.paymentLink ? plan.paymentLink + '?prefilled_email=' + (user?.primaryEmailAddress?.emailAddress || '') : '#'}
        target='_blank'
        rel="noopener noreferrer"
        className="block"
      >
        <Button 
          className={`w-full py-6 rounded-2xl font-semibold text-sm transition-all ${
            isPaid 
              ? 'bg-primary text-white hover:shadow-lg hover:shadow-primary/25' 
              : 'variant-outline border-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          variant={isPaid ? "default" : "outline"}
        >
          {isPaid ? 'Upgrade to Pro' : 'Current Plan'}
        </Button>
      </a>
    </div>
  )
}

export default PlanItemCard