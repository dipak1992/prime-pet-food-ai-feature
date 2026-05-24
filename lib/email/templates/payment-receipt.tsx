import {
  Body, Container, Head, Heading, Html, Link,
  Preview, Section, Text, Hr,
} from '@react-email/components'
import { styles, colors } from './shared'
import { SITE_URL as SITE } from '../client'

interface Props {
  firstName?: string
  amount: string
  date: string
  invoiceId?: string
  invoiceUrl?: string
  planName?: string
}

export function PaymentReceiptEmail({
  firstName,
  amount,
  date,
  invoiceId,
  invoiceUrl,
  planName = 'Plus',
}: Props) {
  const name = firstName ?? 'there'
  return (
    <Html>
      <Head />
      <Preview>Payment confirmed — MealEase {planName}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>

          <Section style={styles.header}>
            <Link href={SITE} style={styles.logo}>MealEase</Link>
          </Section>

          <Section style={styles.body_inner}>
            <Heading style={styles.h1}>Payment confirmed</Heading>

            <Text style={styles.p}>
              Hi {name}, we&apos;ve received your payment. Here&apos;s your receipt:
            </Text>

            <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '24px' }}>
              <tbody>
                <tr>
                  <td style={{ ...styles.muted, paddingBottom: '8px' }}>Plan</td>
                  <td style={{ ...styles.muted, paddingBottom: '8px', textAlign: 'right' as const }}>
                    MealEase {planName}
                  </td>
                </tr>
                <tr>
                  <td style={{ ...styles.muted, paddingBottom: '8px' }}>Amount</td>
                  <td style={{ ...styles.muted, paddingBottom: '8px', textAlign: 'right' as const }}>
                    {amount}
                  </td>
                </tr>
                <tr>
                  <td style={{ ...styles.muted, paddingBottom: '8px' }}>Date</td>
                  <td style={{ ...styles.muted, paddingBottom: '8px', textAlign: 'right' as const }}>
                    {date}
                  </td>
                </tr>
                {invoiceId && (
                  <tr>
                    <td style={styles.muted}>Invoice</td>
                    <td style={{ ...styles.muted, textAlign: 'right' as const }}>{invoiceId}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <Hr style={styles.divider} />

            <Text style={styles.muted}>
              MealEase subscriptions are securely billed through DDS Supply LLC via Stripe.
              {invoiceUrl ? (
                <>
                  {' '}You can also{' '}
                  <Link href={invoiceUrl} style={{ color: colors.sage }}>view your Stripe receipt</Link>.
                </>
              ) : null}
              <br />
              Manage your subscription in{' '}
              <Link href={`${SITE}/settings`} style={{ color: colors.sage }}>settings</Link>.
              Questions? Write to{' '}
              <Link href="mailto:hello@mealeaseai.com" style={{ color: colors.sage }}>
                hello@mealeaseai.com
              </Link>
            </Text>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>MealEase · Payment receipt</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export default PaymentReceiptEmail
