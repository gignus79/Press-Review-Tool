import { ClerkSignInView } from '@/components/ClerkSignInView';

export default function SignInPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--tosky-lighter-gray)] dark:bg-[#0c0c0e] p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(237,53,58,0.14),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(0,119,132,0.18),transparent_40%)]" />
      <ClerkSignInView />
    </div>
  );
}
