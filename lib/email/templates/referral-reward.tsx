import {
  Body, Container, Head, Heading, Html, Link,
  Preview, Section, Text, Hr,
} from '@react-email/components'
import { styles, colors } from './shared'
import { SITE_URL as SITE } from '../client'

interface Props {
  firstName?: string
  referrerName?: string
  rewardDescription?: string
}

export function ReferralRewardEmail({
  firstName,
  referrerName,
  rewardDescription = '1 month of MealEase Pro — free',
}: Props) {
  const name = firstName ?? 'there'
  return (
    <Html>
      <Head />
      <Preview>Your referral reward has arrived — thank you for sharing MealEase.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>

          <Section style={styles.header}>
            <Link href={SITE} style={styles.logo}>MealEase</Link>
          </Section>

          <Section style={styles.body_inner}>
            <Heading style={styles.h1}>Your reward is here 🎁</Heading>

            <Text style={styles.p}>Hi {name},</Text>

            <Text style={styles.p}>
              {referrerName
                ? `Someone you referred — ${referrerName} — just signed up for MealEase.`
                : 'Your referral just joined MealEase.'}
              {' '}As a thank you, here&apos;s your reward:
            </Text>

            <Text style={{
              ...styles.p,
              backgroundColor: '#e8f0e5',
              padding: '16px 20px',
              borderRadius: '8px',
              fontWeight: 600,
            }}>
              🎉 {rewardDescription}
            </Text>

            <Text style={styles.p}>
              Your account has been updated automatically. Keep sharing
              and keep earning.
            </Text>

            <Link href={`${SITE}/referral`} style={styles.button}>
              Share more →
            </Link>

            <Hr style={styles.divider} />

            <Text style={styles.muted}>
              Questions? Write to{' '}
              <Link href="mailto:hello@mealeaseai.com" style={{ color: colors.sage }}>
                hello@mealeaseai.com
              </Link>
            </Text>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>MealEase · Referral reward</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export default ReferralRewardEmail
