import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Akaro account to access your team's collective intelligence.",
};

export default function LoginPage(props: any) {
  return <LoginForm {...props} />;
}
