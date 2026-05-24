'use client'

import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'

const BEFORE = [
  'Open fridge, stare, close fridge',
  'Scroll recipes for 25 minutes',
  'Argue about what everyone wants',
  'Give up, order pizza again',
  'Feel guilty about the money',
  'Throw out unused groceries Sunday',
]

const AFTER = [
  'Open MealEase, tap "Tonight\'s Pick"',
  'See a meal everyone will love — in 3 seconds',
  'Every family member\'s needs already factored in',
  'Grocery list auto-generated',
  'Save $150+/month on takeout',
  'Zero food waste, zero stress',
]

export function LandingBeforeAfter() {
  return (
    <section className="py-24 sm:py-32 bg-[#FAFBFA]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">The difference</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Your daily dinner,{' '}
            <span className="text-gradient-sage">transformed.</span>
          </h2>
        </motion.div>

        {/* Before / After columns */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center">
                <X className="h-4 w-4 text-rose-500" />
              </div>
              <h3 className="text-lg font-bold text-rose-700">Without MealEase</h3>
            </div>
            <ul className="space-y-4">
              {BEFORE.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className="flex items-start gap-3"
                >
                  <X className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-rose-700/80 leading-relaxed">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="h-4 w-4 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-emerald-700">With MealEase</h3>
            </div>
            <ul className="space-y-4">
              {AFTER.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className="flex items-start gap-3"
                >
                  <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-emerald-700/80 leading-relaxed">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
