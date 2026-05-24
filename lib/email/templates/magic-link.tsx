import {
  Body, Container, Head, Heading, Html, Link,
  Preview, Section, Text, Hr,
} from '@react-email/components'
import { styles, colors } from './shared'
import { SITE_URL as SITE } from '../client'

interface Props {
  magicLink: string
  email: string
}

export function MagicLinkEmail({ magicLink, email }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Your MealEase sign-in link — valid for 10 minutes.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>

          <Section style={styles.header}>
            <Link href={SITE} style={styles.logo}>MealEase</Link>
          </Section>

          <Section style={styles.body_inner}>
            <Heading style={styles.h1}>Here&apos;s your sign-in link</Heading>

            <Text style={styles.p}>
              Click below to sign in to MealEase. This link expires in
              10 minutes and can only be used once.
            </Text>

            <Link href={magicLink} style={styles.button}>
              Sign in to MealEase →
            </Link>

            <Hr style={styles.divider} />

            <Text style={styles.muted}>
              Signing in as <strong>{email}</strong>. If you didn&apos;t
              request this, you can safely ignore this email.
            </Text>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Questions?{' '}
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

export default MagicLinkEmail
