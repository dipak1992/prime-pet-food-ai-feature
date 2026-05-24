/**
 * Shared design tokens for all MealEase email templates.
 * Used in inline styles to ensure consistent branding.
 */
export const colors = {
  bg: '#faf9f7',
  card: '#ffffff',
  sage: '#5a7d4f',
  sageLight: '#e8f0e5',
  text: '#1a1a1a',
  muted: '#6b7280',
  border: '#e5e7eb',
  accent: '#f0f7ed',
}

export const font = `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

export const styles = {
  body: {
    backgroundColor: colors.bg,
    margin: 0,
    padding: 0,
    fontFamily: font,
  },
  container: {
    maxWidth: '580px',
    margin: '40px auto',
    backgroundColor: colors.card,
    borderRadius: '12px',
    border: `1px solid ${colors.border}`,
    overflow: 'hidden' as const,
  },
  header: {
    backgroundColor: colors.sage,
    padding: '28px 40px',
  },
  logo: {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: 700,
    textDecoration: 'none',
    letterSpacing: '-0.3px',
  },
  body_inner: {
    padding: '40px',
  },
  h1: {
    color: colors.text,
    fontSize: '24px',
    fontWeight: 700,
    lineHeight: '1.3',
    margin: '0 0 16px',
  },
  p: {
    color: colors.text,
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 16px',
  },
  muted: {
    color: colors.muted,
    fontSize: '14px',
    lineHeight: '1.5',
  },
  button: {
    display: 'inline-block',
    backgroundColor: colors.sage,
    color: '#ffffff',
    padding: '14px 28px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '15px',
    marginTop: '8px',
  },
  divider: {
    borderTop: `1px solid ${colors.border}`,
    margin: '28px 0',
  },
  footer: {
    padding: '24px 40px',
    backgroundColor: colors.bg,
    borderTop: `1px solid ${colors.border}`,
  },
  footerText: {
    color: colors.muted,
    fontSize: '13px',
    lineHeight: '1.6',
    margin: 0,
  },
}
