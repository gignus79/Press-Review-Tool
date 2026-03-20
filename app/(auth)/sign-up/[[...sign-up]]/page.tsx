import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--tosky-lighter-gray)] p-4">
      <SignUp
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
