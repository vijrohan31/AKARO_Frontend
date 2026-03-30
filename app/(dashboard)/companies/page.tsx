import CompaniesClient from "./CompaniesClient"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Companies | Akaro AI",
  description: "Manage and monitor registered companies and their details.",
}

export default function CompaniesPage() {
  return <CompaniesClient initialCompanies={[]} />
}
