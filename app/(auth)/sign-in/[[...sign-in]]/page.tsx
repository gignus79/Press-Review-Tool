import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--tosky-lighter-gray)] p-4">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: '#333333',
            colorBackground: '#ffffff',
            borderRadius: '4px',
          },
        }}
      />
    </div>
  );
}
