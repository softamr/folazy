import { AuthForm } from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] py-12">
      <AuthForm mode="login" />
    </div>
  );
}
