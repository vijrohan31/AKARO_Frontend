import SignupForm from "@/components/auth/SignupForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join Akaro to start building your team's collective intelligence platform.",
};

export default function SignupPage(props: any) {
  return <SignupForm {...props} />;
}
