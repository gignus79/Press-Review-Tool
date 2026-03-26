import { AuthBranding } from '@/components/AuthBranding';
import { ClerkSignUpView } from '@/components/ClerkSignUpView';

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--tosky-lighter-gray)] p-4 dark:bg-[#0c0c0e]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(237,53,58,0.14),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(0,119,132,0.18),transparent_40%)]" />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <AuthBranding />
        <ClerkSignUpView />
      </div>
    </div>
  );
}
