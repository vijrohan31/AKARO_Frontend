import SuperAdminClient from "./SuperAdminClient"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Super Admin | Akaro AI",
  description: "Administrative console for managing the Akaro AI ecosystem.",
}

export default function SuperAdminPage() {
  return <SuperAdminClient initialAdmins={[]} />
}
