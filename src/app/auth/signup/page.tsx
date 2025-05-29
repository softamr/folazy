import { AuthForm } from '@/components/AuthForm';

export default function SignupPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] py-12">
      <AuthForm mode="signup" />
    </div>
  );
}
