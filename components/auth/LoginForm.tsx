"use client";

import { LoginForm as Implementation } from "@/components/LoginForm";

export default function LoginForm(props: any) {
  return <Implementation {...props} />;
}

export { Implementation as LoginForm };
