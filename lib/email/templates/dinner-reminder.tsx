import {
  Body, Container, Head, Heading, Html, Link,
  Preview, Section, Text, Hr,
} from '@react-email/components'
import { styles, colors } from './shared'
import { SITE_URL as SITE } from '../client'

interface Props {
  firstName?: string
  mealTitle?: string
  mealDescription?: string
  unsubscribeUrl?: string
}

export function DinnerReminderEmail({ firstName, mealTitle, mealDescription, unsubscribeUrl }: Props) {
  const name = firstName ?? 'there'
  return (
    <Html>
      <Head />
      <Preview>
        {mealTitle
          ? `Tonight: ${mealTitle} — your dinner is planned.`
          : 'Here&apos;s your dinner for tonight.'}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>

          <Section style={styles.header}>
            <Link href={SITE} style={styles.logo}>MealEase</Link>
          </Section>

          <Section style={styles.body_inner}>
            <Heading style={styles.h1}>Here&apos;s your dinner for tonight</Heading>

            <Text style={styles.p}>Hi {name},</Text>

            {mealTitle ? (
              <>
                <Text style={{
                  ...styles.p,
                  backgroundColor: '#e8f0e5',
                  padding: '16px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                }}>
                  🍽 Tonight: {mealTitle}
                </Text>
                {mealDescription && (
                  <Text style={styles.p}>{mealDescription}</Text>
                )}
              </>
            ) : (
              <Text style={styles.p}>
                Your dinner for tonight is waiting in the app. Head over to see
                what&apos;s on the menu and start prepping.
              </Text>
            )}

            <Link href={`${SITE}/tonight`} style={styles.button}>
              See tonight&apos;s dinner →
            </Link>

            <Hr style={styles.divider} />

            <Text style={styles.muted}>
              To adjust your reminder time or turn this off, visit{' '}
              <Link href={`${SITE}/settings`} style={{ color: colors.sage }}>notification settings</Link>.
            </Text>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>MealEase · Daily dinner reminder</Text>
            {unsubscribeUrl && (
              <Text style={styles.footerText}>
                <Link href={unsubscribeUrl} style={{ color: colors.sage, fontSize: '12px' }}>Unsubscribe</Link>
              </Text>
            )}
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export default DinnerReminderEmail
