import { AuthContainer } from "@/components/authentication/AuthContainer";
import { RegisterForm } from "@/components/authentication/RegisterForm";

export function RegisterPage() {
  return (
    <AuthContainer title="Create your account" subtitle="Start budgeting your energy">
      <RegisterForm />
    </AuthContainer>
  );
}