'use client'

import { motion } from 'framer-motion'
import { Clock, Brain, Frown, Users, ShoppingCart, Flame } from 'lucide-react'

const PAINS = [
  {
    icon: Clock,
    title: '"What should we eat?"',
    description: 'You spend 30+ minutes just deciding. By then, everyone\'s hangry.',
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
  },
  {
    icon: Brain,
    title: 'Decision fatigue is real',
    description: 'After a full day of decisions at work, the last thing you want is another one.',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
  },
  {
    icon: Users,
    title: 'Everyone wants something different',
    description: 'Picky kid. Partner on keto. Toddler with allergies. Good luck pleasing everyone.',
    color: 'text-violet-500',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
  },
  {
    icon: ShoppingCart,
    title: 'Groceries go to waste',
    description: 'You buy ingredients "just in case" and throw them out a week later.',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  {
    icon: Frown,
    title: 'Takeout guilt',
    description: 'You default to delivery again and feel bad about the money and the nutrition.',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: Flame,
    title: 'Same 5 meals on repeat',
    description: 'You rotate the same boring dinners because trying new recipes feels risky.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
]

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export function LandingPain() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 bg-white">
      {/* Background image */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.40,
          filter: 'grayscale(100%)',
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] bg-white/65" />
      <div className="relative z-[2] mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-rose-500 mb-3">Sound familiar?</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
            Why eating every day feels harder
            <br className="hidden sm:block" />
            than it should.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            You&apos;re not bad at cooking. You&apos;re just drowning in decisions.
          </p>
        </motion.div>

        {/* Pain cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {PAINS.map((p) => {
            const Icon = p.icon
            return (
              <motion.div
                key={p.title}
                variants={item}
                className={`rounded-2xl border ${p.border} ${p.bg} p-6 hover:shadow-md transition-shadow`}
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${p.bg} mb-4`}>
                  <Icon className={`h-5 w-5 ${p.color}`} />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Transition line */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-xl sm:text-2xl font-semibold text-foreground">
            What if one app removed{' '}
            <span className="text-gradient-sage">all of this?</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
