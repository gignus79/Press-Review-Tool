import { dark } from '@clerk/themes';

/** Clerk SignIn/SignUp styling: dark uses @clerk/themes/dark + brand primary; light uses crisp contrast on white. */
export function buildClerkAppearance(isDark: boolean) {
  if (isDark) {
    return {
      baseTheme: dark,
      variables: {
        colorPrimary: '#ED353A',
        colorText: '#f4f4f5',
        colorTextSecondary: '#a1a1aa',
        colorBackground: '#18181b',
        colorInputBackground: '#27272a',
        colorInputText: '#fafafa',
        colorNeutral: '#71717a',
        borderRadius: '10px',
      },
      elements: {
        cardBox: 'shadow-2xl border border-zinc-600/80 bg-zinc-900',
        headerTitle: 'text-zinc-50',
        headerSubtitle: 'text-zinc-400',
        socialButtonsBlockButton:
          'border border-zinc-600 bg-zinc-800 text-zinc-100 hover:bg-zinc-700',
        formFieldInput:
          'border border-zinc-600 bg-zinc-800 text-zinc-50 placeholder:text-zinc-500 focus:border-[#ED353A] focus:ring-[#ED353A]/30',
        formFieldLabel: 'text-zinc-200',
        formButtonPrimary:
          'bg-[#ED353A] text-white hover:bg-[#d62d32] shadow-md focus:ring-2 focus:ring-[#ED353A]/50',
        footerActionText: 'text-zinc-400',
        footerActionLink: 'text-zinc-100 hover:text-[#ED353A]',
        identityPreviewText: 'text-zinc-100',
        otpCodeFieldInput: 'border-zinc-600 bg-zinc-800 text-zinc-50',
        dividerLine: 'bg-zinc-600',
        dividerText: 'text-zinc-500',
        alternativeMethodsBlockButton: 'border-zinc-600 bg-zinc-800 text-zinc-200',
      },
    };
  }

  return {
    variables: {
      colorPrimary: '#ED353A',
      colorBackground: '#ffffff',
      colorText: '#0f172a',
      colorInputText: '#0f172a',
      colorInputBackground: '#ffffff',
      colorNeutral: '#64748b',
      borderRadius: '10px',
    },
    elements: {
      cardBox: 'shadow-2xl border border-slate-200 bg-white',
      headerTitle: 'text-slate-900',
      headerSubtitle: 'text-slate-600',
      socialButtonsBlockButton:
        'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
      formFieldInput:
        'border border-slate-300 bg-white text-slate-900 focus:border-[#ED353A] focus:ring-[#ED353A]/25',
      formFieldLabel: 'text-slate-700',
      formButtonPrimary:
        'bg-[#ED353A] text-white hover:bg-[#d62d32] focus:ring-2 focus:ring-[#ED353A]/40',
      footerActionText: 'text-slate-600',
      footerActionLink: 'text-slate-900 hover:text-[#ED353A]',
    },
  };
}
