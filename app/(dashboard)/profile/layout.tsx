import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profile | Akaro AI",
  description: "View and update your personal and organization profile settings.",
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
