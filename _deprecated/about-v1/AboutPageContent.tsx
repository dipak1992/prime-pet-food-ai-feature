'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Quote } from 'lucide-react'

/* ── animation presets ── */
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE },
  },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11 } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.97, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.75, ease: EASE },
  },
}

/* ── blurDataURL (from original page) ── */
const BLUR_DATA =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUE/8QAIRAAAQQCAgMAAAAAAAAAAAAAAQIDBBEABSExUWH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8Ai8e4Tl2btsSnfkWxHFqr1XMRBbBJIAHXYABJ0AOtgmqGMWqxRr9rp4WGKSWSQKN+5JJJJJJJJJJJJJJJJJJJL/2Q=='

/* ── feature grid data ── */
const features = [
  { icon: '✨', title: 'AI meal recommendations', sub: 'Personalized to your household every day' },
  { icon: '📅', title: 'Weekly meal plans', sub: 'Full 7-day plans in one tap' },
  { icon: '🧠', title: "I Don't Want to Think", sub: 'Dinner decided in under 5 seconds' },
  { icon: '📸', title: 'Snap & Cook', sub: 'Your fridge → a real meal tonight' },
  { icon: '🍽️', title: 'Smart Menu Scan', sub: 'Scan any restaurant menu, order smarter' },
  { icon: '🔥', title: 'Food Check', sub: 'Snap any food — see calories & goal fit' },
  { icon: '🛒', title: 'Smart grocery list', sub: 'Built automatically, ready to share' },
  { icon: '🌙', title: 'Zero-Cook Mode', sub: "For the nights you just can't" },
]

export function AboutPageContent() {
  return (
    <div className="min-h-screen bg-background">

      {/* ──────────────────────────────────────────
          HERO — Headline + sub
      ────────────────────────────────────────── */}
      <section className="relative overflow-hidden gradient-cream">
        <div className="mx-auto max-w-4xl px-4 pt-20 pb-12 sm:pt-28 sm:pb-16 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <Badge className="mb-6 border-0 bg-primary/10 text-primary text-xs tracking-widest uppercase font-semibold px-4 py-1.5">
                Our Story
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl font-bold tracking-tight leading-[1.1] sm:text-5xl lg:text-[3.5rem] text-foreground"
            >
              The problem was never cooking.
              <br />
              <span className="text-gradient-sage">It was deciding.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 mx-auto max-w-xl text-lg sm:text-xl text-muted-foreground leading-relaxed"
            >
              We built MealEase because we lived this problem — every single night, in our own kitchen, juggling schedules and hungry kids.
            </motion.p>
          </motion.div>
        </div>

        {/* soft bottom fade into photo */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>

      {/* ──────────────────────────────────────────
          FOUNDER PHOTO — Hero visual anchor
      ────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-2 pb-6">
        <motion.figure
          initial="hidden"
          animate="visible"
          variants={scaleIn}
          className="relative"
        >
          <div
            className="relative overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/8"
            style={{ boxShadow: '0 20px 60px -8px rgba(0,0,0,0.18), 0 4px 16px -4px rgba(0,0,0,0.10)' }}
          >
            {/* Warm gradient overlay — preserves photo warmth, adds depth at base */}
            <div className="absolute inset-0 z-10 pointer-events-none rounded-3xl bg-gradient-to-t from-black/30 via-black/0 to-amber-900/5" />

            <Image
              src="/images/founders-family.jpg"
              alt="Dipak and Suprabha, co-founders of MealEase"
              width={2712}
              height={2536}
              className="h-auto w-full object-cover"
              placeholder="blur"
              blurDataURL={BLUR_DATA}
              priority
            />

            {/* Caption anchored to bottom of image */}
            <div className="absolute bottom-0 left-0 right-0 z-20 px-5 py-4 sm:px-7 sm:py-5">
              <p className="text-white/90 text-sm font-medium tracking-wide drop-shadow-sm">
                Dipak &amp; Suprabha — parents, builders, and the couple behind every feature.
              </p>
            </div>
          </div>
        </motion.figure>
      </section>

      {/* ──────────────────────────────────────────
          WHO WE ARE — Founder intro + chips
      ────────────────────────────────────────── */}
      <section className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="space-y-5"
        >
          <motion.p variants={fadeUp} className="text-[16px] leading-8 text-muted-foreground">
            We&apos;re <strong className="text-foreground">Dipak and Suprabha</strong> — a husband-and-wife team
            based in the United States. Dipak built software products for years and always had the entrepreneurial
            itch. Suprabha is a CPA who understands what it means to manage competing demands, tight schedules, and
            a household at once. Together, we&apos;re raising two kids — ages one and four.
          </motion.p>

          <motion.p variants={fadeUp} className="text-[16px] leading-8 text-muted-foreground">
            We don&apos;t come from the food industry. We&apos;re not celebrity chefs or nutritionists. We&apos;re
            just two working parents who kept running into the same wall, night after night, in our own kitchen.
          </motion.p>

          {/* Founder chips */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            {[
              'Dipak — Software Engineer & Co-Founder',
              'Suprabha — CPA & Co-Founder',
            ].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full bg-muted/70 border border-border/60 px-4 py-2 text-sm font-medium text-foreground"
              >
                <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                {label}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* thin divider */}
      <div className="mx-auto max-w-xs border-t border-border/50" />

      {/* ──────────────────────────────────────────
          THE STRUGGLE
      ────────────────────────────────────────── */}
      <section className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="space-y-6"
        >
          <motion.h2
            variants={fadeUp}
            className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight"
          >
            It starts the same way every night.
          </motion.h2>

          <motion.p variants={fadeUp} className="text-[16px] leading-8 text-muted-foreground">
            6:30 PM. Both of us just home. Kids hungry, energy near zero. We open the fridge — it&apos;s full.
            We&apos;re still stuck.
          </motion.p>

          <motion.p variants={fadeUp} className="text-[16px] leading-8 text-muted-foreground">
            <em className="text-foreground/85">What should we make tonight?</em> Will the four-year-old eat it?
            Does the one-year-old need something different? Do we have all the ingredients, or does someone
            need to make a grocery run? Should we just order in? Again?
          </motion.p>

          <motion.p variants={fadeUp} className="text-[16px] leading-8 text-muted-foreground">
            Some nights the kids wanted completely different things. Some weeks the fridge looked full but
            still couldn&apos;t answer the real question. We weren&apos;t struggling because we didn&apos;t
            know how to cook. We were{' '}
            <strong className="text-foreground">
              struggling because the deciding itself was draining us
            </strong>
            .
          </motion.p>

          <motion.p variants={fadeUp} className="text-[16px] leading-8 text-muted-foreground">
            Night after night. The same exhausting loop. The same quiet drain on the one hour of the day
            that should feel like rest.
          </motion.p>
        </motion.div>
      </section>

      {/* ──────────────────────────────────────────
          BREAKTHROUGH INSIGHT — Full-width pull quote
      ────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        {/* Background */}
        <div className="absolute inset-0 gradient-cream opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center"
        >
          <Quote className="mx-auto mb-8 h-10 w-10 text-primary/25" aria-hidden="true" />

          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
            The problem was never cooking.
          </p>
          <p className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gradient-sage leading-[1.15]">
            The problem was deciding.
          </p>

          <p className="mt-8 text-[16px] sm:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            That one insight changed everything. And it became the entire philosophy behind MealEase.
          </p>
        </motion.div>
      </section>

      {/* ──────────────────────────────────────────
          WHY WE BUILT MEALEASE
      ────────────────────────────────────────── */}
      <section className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="space-y-6"
        >
          <motion.h2
            variants={fadeUp}
            className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight"
          >
            So we built the thing we needed most.
          </motion.h2>

          <motion.p variants={fadeUp} className="text-[16px] leading-8 text-muted-foreground">
            Not another recipe database. Not a complicated nutrition tracker or meal-kit subscription. We
            built a{' '}
            <strong className="text-foreground">calm decision engine</strong> — something that could answer
            the question in seconds and give our evenings back to us.
          </motion.p>

          <motion.p variants={fadeUp} className="text-[16px] leading-8 text-muted-foreground">
            Tell MealEase you&apos;re tired and it picks something effortless. Activate{' '}
            <em className="text-foreground font-medium">I Don&apos;t Want to Think</em> mode and dinner is
            decided before you finish reading this sentence. Snap a photo of your fridge and our{' '}
            <em className="text-foreground font-medium">Snap &amp; Cook</em> feature builds a real meal from
            what you already have — no extra grocery trip needed. Need a whole week planned? It maps out all
            seven nights with kid-friendly variations and a smart grocery list, ready to share.
          </motion.p>

          <motion.p variants={fadeUp} className="text-[16px] leading-8 text-muted-foreground">
            And for the nights where even minimal effort feels impossible,{' '}
            <em className="text-foreground font-medium">Zero-Cook Mode</em> is there. The whole system
            quietly learns your family&apos;s preferences over time — your favorite cuisines, what your kids
            will actually eat, what you usually have on hand — and gets smarter every single week.
          </motion.p>

          <motion.p variants={fadeUp} className="text-[16px] leading-8 text-muted-foreground">
            But we realized the struggle doesn&apos;t stop at your kitchen door. Eating out brings its own
            overwhelm — scanning a 40-item menu while trying to stay on track, wondering if that lunch was
            actually as healthy as it looked. So we built{' '}
            <em className="text-foreground font-medium">Smart Menu Scan</em> — photograph any restaurant
            menu, pick a goal, and get AI-powered recommendations in seconds. And{' '}
            <em className="text-foreground font-medium">Food Check</em> — snap any plate or snack and
            instantly see calorie estimates, protein levels, and whether it fits your goals. MealEase now
            helps you make smarter choices everywhere you eat, not just at home.
          </motion.p>

          <motion.p variants={fadeUp} className="text-[16px] leading-8 text-muted-foreground">
            And because we&apos;re a family ourselves, we built MealEase to grow with yours. Whether you&apos;re
            cooking for one, planning date nights as a couple, or feeding a household of six with wildly different
            preferences — MealEase adapts. Add household profiles for each person, and every meal suggestion
            accounts for everyone at the table. Weekends get their own experience too:{' '}
            <em className="text-foreground font-medium">Weekend Mode</em> activates automatically every Friday
            through Sunday, surfacing dinner + movie ideas tailored to your household — date nights, family nights,
            or solo chill evenings. No setup. It just appears.
          </motion.p>
        </motion.div>
      </section>

      {/* ──────────────────────────────────────────
          FEATURE GRID — What's inside
      ────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {features.map((item) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              className="rounded-2xl border border-border/60 bg-background px-4 py-4 flex flex-col gap-1.5 hover:border-primary/30 transition-colors"
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <p className="text-sm font-semibold text-foreground leading-tight">{item.title}</p>
              <p className="text-xs text-muted-foreground leading-snug">{item.sub}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* thin divider */}
      <div className="mx-auto max-w-xs border-t border-border/50" />

      {/* ──────────────────────────────────────────
          MISSION
      ────────────────────────────────────────── */}
      <section className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="space-y-5"
        >
          <motion.h2
            variants={fadeUp}
            className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight"
          >
            Our mission is simple.
          </motion.h2>

          <motion.p variants={fadeUp} className="text-[16px] leading-8 text-muted-foreground">
            MealEase exists so that people everywhere can have their evenings back. Not the cooking — we
            actually enjoy cooking when it&apos;s a genuine choice. We want to eliminate the decision
            fatigue, the mental overhead, the weekly grocery debate, the quiet{' '}
            <em>&ldquo;I don&apos;t know, what do you want?&rdquo;</em> loop that slowly chips away at the
            one hour of the day that should belong to you.
          </motion.p>

          <motion.p variants={fadeUp} className="text-[16px] leading-8 text-muted-foreground">
            We want MealEase to feel the way the best tools feel —{' '}
            <strong className="text-foreground">simple, human, and genuinely useful</strong>. Not one more
            complicated app to manage. Just a better way to get from 6:30 PM overwhelm to dinner on the table.
          </motion.p>
        </motion.div>
      </section>

      {/* ──────────────────────────────────────────
          LETTER CLOSING
      ────────────────────────────────────────── */}
      <section className="mx-auto max-w-2xl px-4 sm:px-6 pb-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="rounded-3xl border border-border/60 bg-muted/25 px-7 py-9 sm:px-10 sm:py-11 space-y-5"
        >
          <motion.p variants={fadeUp} className="text-[16px] leading-8 text-muted-foreground">
            If MealEase gives even one household a calmer evening — a shorter grocery debate, one less round of{' '}
            <em>&ldquo;what should we eat?&rdquo;</em>, one night where dinner just happens — then
            it&apos;s doing exactly what we hoped it would do.
          </motion.p>

          <motion.p variants={fadeUp} className="text-[16px] leading-8 text-muted-foreground">
            And if you ever have feedback, a story to share, or just want to tell us what your kids
            actually ended up eating — we genuinely read every message.
          </motion.p>

          {/* Contact */}
          <motion.p variants={fadeUp} className="text-[16px] text-foreground font-medium">
            Questions or feedback?{' '}
            <a
              href="mailto:hello@mealeaseai.com"
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              hello@mealeaseai.com
            </a>
          </motion.p>

          {/* Sign-off */}
          <motion.div
            variants={fadeUp}
            className="pt-4 border-t border-border/50"
          >
            <p className="text-[15px] text-muted-foreground italic leading-relaxed">
              With gratitude,
            </p>
            <p className="mt-1 text-[15px] font-semibold text-foreground">
              Dipak &amp; Suprabha
            </p>
            <p className="text-sm text-muted-foreground">Co-Founders, MealEase</p>
          </motion.div>
        </motion.div>
      </section>

      {/* ──────────────────────────────────────────
          CTA
      ────────────────────────────────────────── */}
      <section className="mx-auto max-w-2xl px-4 sm:px-6 pb-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp}
          className="rounded-3xl glass-card border border-border/60 px-6 py-10 text-center"
        >
          <h2 className="text-2xl font-bold mb-3">Ready to end the dinner debate?</h2>
          <p className="text-muted-foreground mb-7 text-[15px] leading-relaxed">
            Join thousands of households who already know what&apos;s for dinner tonight.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="gradient-sage border-0 text-white hover:opacity-90">
              <Link href="/signup">Get started free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            No credit card required &middot; Free plan available
          </p>
        </motion.div>
      </section>

    </div>
  )
}
