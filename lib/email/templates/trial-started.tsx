import {
  Body, Container, Head, Heading, Html, Link,
  Preview, Section, Text, Hr,
} from '@react-email/components'
import { styles, colors } from './shared'
import { SITE_URL as SITE } from '../client'

interface Props {
  firstName?: string
  trialDays?: number
  trialEndDate?: string
}

export function TrialStartedEmail({ firstName, trialDays = 14, trialEndDate }: Props) {
  const name = firstName ?? 'there'
  return (
    <Html>
      <Head />
      <Preview>{`Your ${trialDays}-day MealEase Plus trial has started — explore everything free.`}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>

          <Section style={styles.header}>
            <Link href={SITE} style={styles.logo}>MealEase</Link>
          </Section>

          <Section style={styles.body_inner}>
            <Heading style={styles.h1}>Your {trialDays}-day Plus trial is live 🎉</Heading>

            <Text style={styles.p}>
              Hi {name}, welcome to MealEase Plus. For the next {trialDays} days you have
              full access to weekly planning, smart grocery lists, leftovers, budget context,
              and household memory.
            </Text>

            <Text style={styles.p}>
              Here&apos;s what&apos;s waiting for you:
            </Text>

            <Text style={{ ...styles.p, paddingLeft: '16px', borderLeft: `3px solid ${colors.sage}` }}>
              ✦ Generate a full week of meals in seconds<br />
              ✦ Auto-build your grocery list from the plan<br />
              ✦ Track what&apos;s in your pantry so nothing goes to waste<br />
              ✦ Dietary filters: gluten-free, vegan, keto, and more
            </Text>

            <Link href={`${SITE}/dashboard`} style={styles.button}>
              Start planning →
            </Link>

            <Hr style={styles.divider} />

            <Text style={styles.muted}>
              {trialEndDate
                ? `Your trial ends on ${trialEndDate}. `
                : ''}
              We&apos;ll send you a reminder before the trial ends.
              MealEase subscriptions are securely billed through DDS Supply LLC via Stripe.
              Questions? <Link href="mailto:hello@mealeaseai.com" style={{ color: colors.sage }}>hello@mealeaseai.com</Link>
            </Text>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>MealEase · Trial confirmation</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export default TrialStartedEmail
