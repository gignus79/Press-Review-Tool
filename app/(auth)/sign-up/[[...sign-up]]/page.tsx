import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--tosky-lighter-gray)] dark:bg-[#17191f] p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(237,53,58,0.16),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(0,119,132,0.22),transparent_40%)]" />
      <SignUp
        appearance={{
          variables: {
            colorPrimary: '#1f2937',
            colorBackground: '#ffffff',
            colorText: '#0f172a',
            colorInputText: '#0f172a',
            colorInputBackground: '#ffffff',
            colorNeutral: '#64748b',
            borderRadius: '10px',
          },
          elements: {
            cardBox:
              'shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#f8fafc]',
            headerTitle: 'text-slate-900',
            headerSubtitle: 'text-slate-600',
            socialButtonsBlockButton:
              'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100',
            formFieldInput:
              'border border-slate-300 bg-white text-slate-900 focus:border-slate-500 focus:ring-slate-500',
            formFieldLabel: 'text-slate-700',
            formButtonPrimary:
              'bg-slate-800 text-white hover:bg-slate-700 focus:ring-2 focus:ring-slate-500',
            footerActionText: 'text-slate-600',
            footerActionLink: 'text-slate-900 hover:text-slate-700',
          },
        }}
      />
    </div>
  );
}
