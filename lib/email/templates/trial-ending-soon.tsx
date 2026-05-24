import {
  Body, Container, Head, Heading, Html, Link,
  Preview, Section, Text, Hr,
} from '@react-email/components'
import { styles, colors } from './shared'
import { SITE_URL as SITE } from '../client'

interface Props {
  firstName?: string
  daysLeft?: number
  trialEndDate?: string
  upgradeUrl?: string
}

export function TrialEndingSoonEmail({ firstName, daysLeft = 3, trialEndDate, upgradeUrl }: Props) {
  const name = firstName ?? 'there'
  const ctaUrl = upgradeUrl ?? `${SITE}/upgrade`
  return (
    <Html>
      <Head />
      <Preview>{`Your MealEase Pro trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} — keep the momentum going.`}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>

          <Section style={styles.header}>
            <Link href={SITE} style={styles.logo}>MealEase</Link>
          </Section>

          <Section style={styles.body_inner}>
            <Heading style={styles.h1}>
              {daysLeft === 1 ? 'Last day of your trial' : `${daysLeft} days left on your trial`}
            </Heading>

            <Text style={styles.p}>
              Hi {name}, your MealEase Plus trial
              {trialEndDate ? ` ends on ${trialEndDate}` : ` ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}.
              After that, your account moves to the free plan and your current meal
              plans and grocery lists will stay. Plus-only planning, grocery, leftovers, and budget features will pause.
            </Text>

            <Text style={styles.p}>
              Upgrade now to keep everything running without interruption.
            </Text>

            <Link href={ctaUrl} style={styles.button}>
              Upgrade to Plus →
            </Link>

            <Hr style={styles.divider} />

            <Text style={styles.muted}>
              If you don&apos;t upgrade, your account simply reverts to free — no surprise charge,
              no hassle. Changed your mind about the trial?{' '}
              <Link href="mailto:hello@mealeaseai.com" style={{ color: colors.sage }}>Let us know</Link>.
            </Text>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>MealEase · Trial reminder</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export default TrialEndingSoonEmail
