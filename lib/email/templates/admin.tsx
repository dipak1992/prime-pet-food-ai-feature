import {
  Body, Container, Head, Heading, Html, Link,
  Preview, Section, Text, Hr,
} from '@react-email/components'
import { styles, colors } from './shared'
import { SITE_URL as SITE } from '../client'

interface Props {
  userEmail: string
  userId: string
  signupAt?: string
  referralCode?: string
}

export function AdminNewUserEmail({ userEmail, userId, signupAt, referralCode }: Props) {
  const ts = signupAt ?? new Date().toISOString()
  return (
    <Html>
      <Head />
      <Preview>[MealEase] New user signup — {userEmail}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Link href={SITE} style={styles.logo}>MealEase Admin</Link>
          </Section>
          <Section style={styles.body_inner}>
            <Heading style={styles.h1}>New user signed up</Heading>
            <table width="100%" cellPadding="0" cellSpacing="0">
              <tbody>
                <AdminRow label="Email" value={userEmail} />
                <AdminRow label="User ID" value={userId} />
                <AdminRow label="Signed up" value={ts} />
                {referralCode && <AdminRow label="Referral code" value={referralCode} />}
              </tbody>
            </table>
          </Section>
          <Section style={styles.footer}>
            <Text style={styles.footerText}>MealEase · Internal admin alert</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export function AdminNewProEmail({
  userEmail,
  userId,
  planName = 'Plus',
  amount,
}: {
  userEmail: string
  userId: string
  planName?: string
  amount?: string
}) {
  return (
    <Html>
      <Head />
      <Preview>[MealEase] New Pro subscription — {userEmail}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Link href={SITE} style={styles.logo}>MealEase Admin</Link>
          </Section>
          <Section style={styles.body_inner}>
            <Heading style={styles.h1}>New {planName} subscription 🎉</Heading>
            <table width="100%" cellPadding="0" cellSpacing="0">
              <tbody>
                <AdminRow label="Email" value={userEmail} />
                <AdminRow label="User ID" value={userId} />
                <AdminRow label="Plan" value={planName} />
                {amount && <AdminRow label="Amount" value={amount} />}
                <AdminRow label="Upgraded at" value={new Date().toISOString()} />
              </tbody>
            </table>
          </Section>
          <Section style={styles.footer}>
            <Text style={styles.footerText}>MealEase · Internal admin alert</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export function AdminFailedPaymentEmail({
  userEmail,
  userId,
  reason,
  amount,
}: {
  userEmail: string
  userId: string
  reason?: string
  amount?: string
}) {
  return (
    <Html>
      <Head />
      <Preview>[MealEase] ⚠️ Failed payment — {userEmail}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={{ ...styles.header, backgroundColor: '#b91c1c' }}>
            <Link href={SITE} style={styles.logo}>MealEase Admin</Link>
          </Section>
          <Section style={styles.body_inner}>
            <Heading style={styles.h1}>⚠️ Payment failed</Heading>
            <table width="100%" cellPadding="0" cellSpacing="0">
              <tbody>
                <AdminRow label="Email" value={userEmail} />
                <AdminRow label="User ID" value={userId} />
                {amount && <AdminRow label="Amount" value={amount} />}
                {reason && <AdminRow label="Reason" value={reason} />}
                <AdminRow label="Failed at" value={new Date().toISOString()} />
              </tbody>
            </table>
          </Section>
          <Section style={styles.footer}>
            <Text style={styles.footerText}>MealEase · Internal admin alert</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export function AdminBillingEventEmail({
  title,
  userEmail,
  userId,
  event,
  amount,
  detail,
}: {
  title: string
  userEmail: string
  userId: string
  event: string
  amount?: string
  detail?: string
}) {
  return (
    <Html>
      <Head />
      <Preview>[MealEase] {title} — {userEmail}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Link href={SITE} style={styles.logo}>MealEase Admin</Link>
          </Section>
          <Section style={styles.body_inner}>
            <Heading style={styles.h1}>{title}</Heading>
            <table width="100%" cellPadding="0" cellSpacing="0">
              <tbody>
                <AdminRow label="Email" value={userEmail} />
                <AdminRow label="User ID" value={userId} />
                <AdminRow label="Event" value={event} />
                {amount && <AdminRow label="Amount" value={amount} />}
                {detail && <AdminRow label="Detail" value={detail} />}
                <AdminRow label="At" value={new Date().toISOString()} />
              </tbody>
            </table>
          </Section>
          <Section style={styles.footer}>
            <Text style={styles.footerText}>MealEase · Internal billing alert</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export function AdminReferralEmail({
  referrerEmail,
  referrerId,
  newUserEmail,
}: {
  referrerEmail: string
  referrerId: string
  newUserEmail: string
}) {
  return (
    <Html>
      <Head />
      <Preview>[MealEase] Referral conversion — {referrerEmail}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Link href={SITE} style={styles.logo}>MealEase Admin</Link>
          </Section>
          <Section style={styles.body_inner}>
            <Heading style={styles.h1}>Referral conversion</Heading>
            <table width="100%" cellPadding="0" cellSpacing="0">
              <tbody>
                <AdminRow label="Referrer email" value={referrerEmail} />
                <AdminRow label="Referrer ID" value={referrerId} />
                <AdminRow label="New user" value={newUserEmail} />
                <AdminRow label="Converted at" value={new Date().toISOString()} />
              </tbody>
            </table>
          </Section>
          <Section style={styles.footer}>
            <Text style={styles.footerText}>MealEase · Internal admin alert</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export function AdminContactFormEmail({
  senderEmail,
  senderName,
  message,
}: {
  senderEmail: string
  senderName?: string
  message: string
}) {
  return (
    <Html>
      <Head />
      <Preview>[MealEase] New contact form — {senderEmail}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Link href={SITE} style={styles.logo}>MealEase Admin</Link>
          </Section>
          <Section style={styles.body_inner}>
            <Heading style={styles.h1}>New contact form submission</Heading>
            <table width="100%" cellPadding="0" cellSpacing="0">
              <tbody>
                <AdminRow label="Email" value={senderEmail} />
                {senderName && <AdminRow label="Name" value={senderName} />}
                <AdminRow label="Submitted at" value={new Date().toISOString()} />
              </tbody>
            </table>
            <Hr style={styles.divider} />
            <Text style={{ ...styles.p, fontWeight: 600 }}>Message:</Text>
            <Text style={{
              ...styles.p,
              backgroundColor: '#f9fafb',
              padding: '16px',
              borderRadius: '8px',
              borderLeft: `4px solid ${colors.sage}`,
              whiteSpace: 'pre-wrap',
            }}>
              {message}
            </Text>
          </Section>
          <Section style={styles.footer}>
            <Text style={styles.footerText}>MealEase · Internal admin alert</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export function AdminWeeklySummaryEmail({
  weekStart,
  newUsers,
  newPro,
  totalUsers,
  emailsSent,
  failures,
}: {
  weekStart: string
  newUsers: number
  newPro: number
  totalUsers: number
  emailsSent: number
  failures: number
}) {
  return (
    <Html>
      <Head />
      <Preview>[MealEase] Weekly summary — {weekStart}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Link href={SITE} style={styles.logo}>MealEase Admin</Link>
          </Section>
          <Section style={styles.body_inner}>
            <Heading style={styles.h1}>Weekly summary</Heading>
            <Text style={styles.muted}>Week starting {weekStart}</Text>
            <Hr style={styles.divider} />
            <table width="100%" cellPadding="0" cellSpacing="0">
              <tbody>
                <AdminRow label="New signups" value={String(newUsers)} />
                <AdminRow label="New Pro subscribers" value={String(newPro)} />
                <AdminRow label="Total users" value={String(totalUsers)} />
                <AdminRow label="Emails sent" value={String(emailsSent)} />
                <AdminRow label="Email failures" value={String(failures)} />
              </tbody>
            </table>
          </Section>
          <Section style={styles.footer}>
            <Text style={styles.footerText}>MealEase · Weekly admin summary</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ─── Shared admin row component ──────────────────────────────────────────────

function AdminRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td style={{
        ...styles.muted,
        paddingBottom: '10px',
        paddingRight: '16px',
        fontWeight: 600,
        width: '40%',
        verticalAlign: 'top',
      }}>
        {label}
      </td>
      <td style={{ ...styles.muted, paddingBottom: '10px', verticalAlign: 'top' }}>
        {value}
      </td>
    </tr>
  )
}
