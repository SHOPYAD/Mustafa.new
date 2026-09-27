/**
 * In-process email scheduler removed. PocketBase cron hook calls
 * POST /api/cron/email-dispatch with EMAIL_CRON_SECRET every minute.
 */
export function startEmailScheduler(): void {
  /* no-op — kept so leftover imports do not start a timer */
}
