import { AuthBranding } from '@/components/AuthBranding';
import { AuthPageShell } from '@/components/AuthPageShell';
import { ClerkSignUpView } from '@/components/ClerkSignUpView';

export default function SignUpPage() {
  return (
    <AuthPageShell>
      <AuthBranding />
      <ClerkSignUpView />
    </AuthPageShell>
  );
}
