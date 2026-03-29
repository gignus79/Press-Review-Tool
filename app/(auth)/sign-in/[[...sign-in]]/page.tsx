import { AuthBranding } from '@/components/AuthBranding';
import { AuthPageShell } from '@/components/AuthPageShell';
import { ClerkSignInView } from '@/components/ClerkSignInView';

export default function SignInPage() {
  return (
    <AuthPageShell>
      <AuthBranding />
      <ClerkSignInView />
    </AuthPageShell>
  );
}
