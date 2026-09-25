import { AuthContainer } from "@/components/authentication/AuthContainer";
import { LoginForm } from "@/components/authentication/LoginForm";

export function LoginPage() {
  return (
    <AuthContainer title="Welcome back" subtitle="Log in to your account">
      <LoginForm />
    </AuthContainer>
  );
}
