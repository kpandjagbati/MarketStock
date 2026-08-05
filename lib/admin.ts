export function getAdminEmails(): string[] {
  const raw =
    process.env.ADMIN_EMAILS ||
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
    ""

  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return getAdminEmails().includes(email.trim().toLowerCase())
}

export function isAdminFromClerkUser(user: {
  primaryEmailAddress?: { emailAddress?: string | null } | null
  publicMetadata?: Record<string, unknown> | null
} | null | undefined): boolean {
  if (!user) return false
  if (user.publicMetadata?.role === "admin") return true
  return isAdminEmail(user.primaryEmailAddress?.emailAddress)
}
