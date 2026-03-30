import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | Akaro AI",
  description: "Monitor your organization's performance and intelligence metrics.",
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
