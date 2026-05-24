import {
  Body, Container, Head, Heading, Html, Link,
  Preview, Section, Text, Hr,
} from '@react-email/components'
import { styles, colors } from './shared'
import { SITE_URL as SITE } from '../client'

interface Props {
  firstName?: string
  email: string
}

export function SupportConfirmationEmail({ firstName, email }: Props) {
  const name = firstName ?? 'there'
  return (
    <Html>
      <Head />
      <Preview>We got your message — we&apos;ll be in touch soon.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>

          <Section style={styles.header}>
            <Link href={SITE} style={styles.logo}>MealEase</Link>
          </Section>

          <Section style={styles.body_inner}>
            <Heading style={styles.h1}>We&apos;ve got your message</Heading>

            <Text style={styles.p}>Hi {name},</Text>

            <Text style={styles.p}>
              Thanks for reaching out. We received your message and will
              get back to you as soon as we can — usually within 1 business day.
            </Text>

            <Text style={styles.p}>
              We&apos;ll reply to{' '}
              <strong>{email}</strong>.
              If that&apos;s not right, feel free to write to us directly at{' '}
              <Link href="mailto:hello@mealeaseai.com" style={{ color: colors.sage }}>
                hello@mealeaseai.com
              </Link>
            </Text>

            <Hr style={styles.divider} />

            <Text style={styles.muted}>
              In the meantime, you can keep planning meals at{' '}
              <Link href={`${SITE}/dashboard`} style={{ color: colors.sage }}>mealeaseai.com</Link>.
            </Text>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>MealEase · Support confirmation</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export default SupportConfirmationEmail
