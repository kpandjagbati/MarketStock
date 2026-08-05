import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { isAdminEmail } from "@/lib/admin"
import AdminShell from "./components/AdminShell"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress
  const role = user?.publicMetadata?.role

  if (!user || (role !== "admin" && !isAdminEmail(email))) {
    redirect("/?error=unauthorized")
  }

  return <AdminShell>{children}</AdminShell>
}
