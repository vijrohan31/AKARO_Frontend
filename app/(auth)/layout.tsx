import AuthLayoutSecond from "@/components/auth/AuthLayoutSecond";

export default function AuthLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayoutSecond>{children}</AuthLayoutSecond>;
}
