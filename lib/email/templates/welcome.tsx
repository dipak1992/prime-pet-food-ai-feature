import {
  Body, Container, Head, Heading, Html, Link,
  Preview, Section, Text, Hr,
} from '@react-email/components'
import { styles, colors } from './shared'
import { SITE_URL as SITE } from '../client'

interface Props {
  firstName?: string
}

export function WelcomeEmail({ firstName }: Props) {
  const name = firstName ?? 'there'
  return (
    <Html>
      <Head />
      <Preview>Welcome to MealEase — your meals are sorted.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>

          <Section style={styles.header}>
            <Link href={SITE} style={styles.logo}>MealEase</Link>
          </Section>

          <Section style={styles.body_inner}>
            <Heading style={styles.h1}>Welcome, {name} 👋</Heading>

            <Text style={styles.p}>
              We&apos;re really glad you&apos;re here. MealEase helps you plan
              dinners in seconds, discover meals your family actually likes, and
              stop the daily &ldquo;what&apos;s for dinner?&rdquo; spiral.
            </Text>

            <Text style={styles.p}>
              Everything is ready — just open the app and let&apos;s build your
              first weekly plan together.
            </Text>

            <Link href={`${SITE}/dashboard`} style={styles.button}>
              Get started →
            </Link>

            <Hr style={styles.divider} />

            <Text style={styles.muted}>
              New here? Start by telling us <Link href={`${SITE}/onboarding`} style={{ color: colors.sage }}>your family&apos;s preferences</Link>.
              It only takes 60 seconds and makes every suggestion more personal.
            </Text>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              You received this because you created a MealEase account.
              Questions? Reply to this email or write to{' '}
              <Link href="mailto:hello@mealeaseai.com" style={{ color: colors.sage }}>
                hello@mealeaseai.com
              </Link>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail
