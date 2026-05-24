import { createElement } from 'react'
import { sendEmail } from './send'
import { EMAIL_ALERTS, SITE_URL } from './client'
import { generateUnsubscribeToken } from './unsubscribe'

// User templates
import { WelcomeEmail } from './templates/welcome'
import { MagicLinkEmail } from './templates/magic-link'
import { ProConfirmationEmail } from './templates/pro-confirmation'
import { PaymentReceiptEmail } from './templates/payment-receipt'
import { WeeklyReminderEmail } from './templates/weekly-reminder'
import { DinnerReminderEmail } from './templates/dinner-reminder'
import { SupportConfirmationEmail } from './templates/support-confirmation'
import { TrialStartedEmail } from './templates/trial-started'
import { TrialEndingSoonEmail } from './templates/trial-ending-soon'
import { ReactivationEmail } from './templates/reactivation'
import { ChurnWinbackEmail } from './templates/churn-winback'
import {
  CancellationConfirmationEmail,
  FailedPaymentEmail,
  RefundConfirmationEmail,
} from './templates/billing-status'

// Admin templates
import {
  AdminNewUserEmail,
  AdminNewProEmail,
  AdminFailedPaymentEmail,
  AdminBillingEventEmail,
  AdminContactFormEmail,
  AdminWeeklySummaryEmail,
} from './templates/admin'

// ─── User triggers ──────────────────────────────────────────────────────────

export async function sendWelcomeEmail(params: {
  to: string
  firstName?: string
}) {
  return sendEmail({
    to: params.to,
    subject: 'Welcome to MealEase 👋',
    react: createElement(WelcomeEmail, { firstName: params.firstName }),
    idempotencyKey: `welcome:${params.to}`,
  })
}

export async function sendMagicLinkEmail(params: {
  to: string
  magicLink: string
}) {
  return sendEmail({
    to: params.to,
    subject: 'Your MealEase sign-in link',
    react: createElement(MagicLinkEmail, {
      magicLink: params.magicLink,
      email: params.to,
    }),
    // Magic links are time-sensitive — no idempotency key
  })
}

export async function sendProConfirmationEmail(params: {
  to: string
  firstName?: string
  planName?: string
  subscriptionId?: string
}) {
  return sendEmail({
    to: params.to,
    subject: 'You\'re on MealEase Plus ✨',
    react: createElement(ProConfirmationEmail, {
      firstName: params.firstName,
      planName: params.planName ?? 'Plus',
    }),
    idempotencyKey: params.subscriptionId
      ? `plus-confirm:${params.subscriptionId}`
      : `plus-confirm:${params.to}:${params.planName ?? 'Plus'}`,
  })
}

export async function sendPaymentReceiptEmail(params: {
  to: string
  firstName?: string
  amount: string
  date: string
  invoiceId?: string
  invoiceUrl?: string
  planName?: string
}) {
  return sendEmail({
    to: params.to,
    subject: 'MealEase payment confirmed',
    react: createElement(PaymentReceiptEmail, params),
    idempotencyKey: params.invoiceId ? `receipt:${params.invoiceId}` : undefined,
  })
}

export async function sendWeeklyReminderEmail(params: {
  to: string
  firstName?: string
  userId?: string
}) {
  const week = getWeekKey()
  const unsubscribeUrl = params.userId
    ? `${SITE_URL}/api/unsubscribe?token=${generateUnsubscribeToken(params.userId)}`
    : undefined
  return sendEmail({
    to: params.to,
    subject: 'Plan your week in 30 seconds',
    react: createElement(WeeklyReminderEmail, { firstName: params.firstName, unsubscribeUrl }),
    idempotencyKey: `weekly:${params.to}:${week}`,
    headers: unsubscribeUrl
      ? { 'List-Unsubscribe': `<${unsubscribeUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
      : undefined,
  })
}

export async function sendDinnerReminderEmail(params: {
  to: string
  firstName?: string
  mealTitle?: string
  mealDescription?: string
  userId?: string
}) {
  const today = getTodayKey()
  const unsubscribeUrl = params.userId
    ? `${SITE_URL}/api/unsubscribe?token=${generateUnsubscribeToken(params.userId)}`
    : undefined
  return sendEmail({
    to: params.to,
    subject: params.mealTitle
      ? `Tonight: ${params.mealTitle}`
      : 'Here\'s your dinner for tonight',
    react: createElement(DinnerReminderEmail, {
      firstName: params.firstName,
      mealTitle: params.mealTitle,
      mealDescription: params.mealDescription,
      unsubscribeUrl,
    }),
    idempotencyKey: `dinner:${params.to}:${today}`,
    headers: unsubscribeUrl
      ? { 'List-Unsubscribe': `<${unsubscribeUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
      : undefined,
  })
}

export async function sendSupportConfirmationEmail(params: {
  to: string
  firstName?: string
}) {
  return sendEmail({
    to: params.to,
    subject: 'We\'ve got your message',
    react: createElement(SupportConfirmationEmail, {
      firstName: params.firstName,
      email: params.to,
    }),
  })
}

export async function sendFailedPaymentEmail(params: {
  to: string
  firstName?: string
  amount?: string
  invoiceId?: string
  invoiceUrl?: string
}) {
  return sendEmail({
    to: params.to,
    subject: 'Action needed: MealEase Plus billing',
    react: createElement(FailedPaymentEmail, params),
    idempotencyKey: params.invoiceId ? `failed-payment:${params.invoiceId}` : undefined,
  })
}

export async function sendCancellationConfirmationEmail(params: {
  to: string
  firstName?: string
  subscriptionId?: string
  accessEndsAt?: string
}) {
  return sendEmail({
    to: params.to,
    subject: 'MealEase Plus cancellation confirmed',
    react: createElement(CancellationConfirmationEmail, params),
    idempotencyKey: params.subscriptionId ? `cancelled:${params.subscriptionId}` : undefined,
  })
}

export async function sendRefundConfirmationEmail(params: {
  to: string
  firstName?: string
  amount?: string
  refundId?: string
}) {
  return sendEmail({
    to: params.to,
    subject: 'MealEase refund processed',
    react: createElement(RefundConfirmationEmail, params),
    idempotencyKey: params.refundId ? `refund:${params.refundId}` : undefined,
  })
}

// ─── Admin triggers ─────────────────────────────────────────────────────────

export async function alertAdminNewUser(params: {
  userEmail: string
  userId: string
  signupAt?: string
  referralCode?: string
}) {
  return sendEmail({
    to: EMAIL_ALERTS,
    subject: `[MealEase] New signup — ${params.userEmail}`,
    react: createElement(AdminNewUserEmail, params),
    skipLog: true,
  })
}

export async function alertAdminNewPro(params: {
  userEmail: string
  userId: string
  planName?: string
  amount?: string
}) {
  return sendEmail({
    to: EMAIL_ALERTS,
    subject: `[MealEase] New Pro — ${params.userEmail}`,
    react: createElement(AdminNewProEmail, params),
    skipLog: true,
  })
}

export async function alertAdminFailedPayment(params: {
  userEmail: string
  userId: string
  reason?: string
  amount?: string
}) {
  return sendEmail({
    to: EMAIL_ALERTS,
    subject: `[MealEase] ⚠️ Failed payment — ${params.userEmail}`,
    react: createElement(AdminFailedPaymentEmail, params),
    skipLog: true,
  })
}

export async function alertAdminBillingEvent(params: {
  title: string
  userEmail: string
  userId: string
  event: string
  amount?: string
  detail?: string
}) {
  return sendEmail({
    to: EMAIL_ALERTS,
    subject: `[MealEase] ${params.title} — ${params.userEmail}`,
    react: createElement(AdminBillingEventEmail, params),
    skipLog: true,
  })
}

export async function alertAdminContactForm(params: {
  senderEmail: string
  senderName?: string
  message: string
}) {
  return sendEmail({
    to: EMAIL_ALERTS,
    subject: `[MealEase] Contact form — ${params.senderEmail}`,
    react: createElement(AdminContactFormEmail, params),
    skipLog: true,
  })
}

export async function sendAdminWeeklySummary(params: {
  weekStart: string
  newUsers: number
  newPro: number
  totalUsers: number
  emailsSent: number
  failures: number
}) {
  return sendEmail({
    to: EMAIL_ALERTS,
    subject: `[MealEase] Weekly summary — ${params.weekStart}`,
    react: createElement(AdminWeeklySummaryEmail, params),
    skipLog: true,
  })
}

export async function sendTrialStartedEmail(params: {
  to: string
  firstName?: string
  trialDays?: number
  trialEndDate?: string
  subscriptionId?: string
}) {
  return sendEmail({
    to: params.to,
    subject: `Your ${params.trialDays ?? 7}-day MealEase Plus trial has started`,
    react: createElement(TrialStartedEmail, params),
    idempotencyKey: params.subscriptionId
      ? `trial-started:${params.subscriptionId}`
      : `trial-started:${params.to}`,
  })
}

export async function sendTrialEndingSoonEmail(params: {
  to: string
  firstName?: string
  daysLeft?: number
  trialEndDate?: string
  upgradeUrl?: string
}) {
  return sendEmail({
    to: params.to,
    subject: `Your MealEase trial ends in ${params.daysLeft ?? 3} day${(params.daysLeft ?? 3) !== 1 ? 's' : ''}`,
    react: createElement(TrialEndingSoonEmail, params),
  })
}

export async function sendReactivationEmail(params: {
  to: string
  firstName?: string
  lastActiveDate?: string
  userId?: string
}) {
  const today = getTodayKey()
  const unsubscribeUrl = params.userId
    ? `${SITE_URL}/api/unsubscribe?token=${generateUnsubscribeToken(params.userId)}`
    : undefined
  return sendEmail({
    to: params.to,
    subject: 'Your meal plans are waiting for you',
    react: createElement(ReactivationEmail, { firstName: params.firstName, lastActiveDate: params.lastActiveDate }),
    idempotencyKey: `reactivation:${params.to}:${today.slice(0, 7)}`, // once per month
    headers: unsubscribeUrl
      ? { 'List-Unsubscribe': `<${unsubscribeUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
      : undefined,
  })
}

export async function sendChurnWinbackEmail(params: {
  to: string
  firstName?: string
  daysSince?: number
  userId?: string
}) {
  const today = getTodayKey()
  const unsubscribeUrl = params.userId
    ? `${SITE_URL}/api/unsubscribe?token=${generateUnsubscribeToken(params.userId)}`
    : undefined
  return sendEmail({
    to: params.to,
    subject: `Hey ${params.firstName ?? 'there'}, still thinking about dinner?`,
    react: createElement(ChurnWinbackEmail, {
      firstName: params.firstName,
      daysSince: params.daysSince,
      unsubscribeUrl,
    }),
    idempotencyKey: `winback:${params.to}:${today.slice(0, 7)}`, // once per month
    headers: unsubscribeUrl
      ? { 'List-Unsubscribe': `<${unsubscribeUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
      : undefined,
  })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTodayKey() {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

function getWeekKey() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().slice(0, 10)
}
