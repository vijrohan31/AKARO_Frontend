import UsersClient from "./UsersClient"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Users | Akaro AI",
  description: "Manage and monitor your organization's users.",
}

export default function UsersPage() {
  return <UsersClient initialUsers={[]} />
}
