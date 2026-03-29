import { dark } from '@clerk/themes';

/** Pulsante utente in header: contrasto chiaro/scuro esplicito (evita “pill” vuota in light mode). */
export function buildUserButtonAppearance(isDark: boolean) {
  if (isDark) {
    return {
      elements: {
        userButtonTrigger:
          'rounded-full border border-zinc-500/90 bg-zinc-800/90 text-zinc-100 shadow-sm hover:bg-zinc-700',
        userButtonPopoverCard: 'border border-zinc-600 bg-zinc-900 text-zinc-100',
        userButtonPopoverActionButton: 'text-zinc-200 hover:bg-zinc-800',
      },
    };
  }
  return {
    elements: {
      userButtonTrigger:
        'rounded-full border border-slate-300 bg-white text-slate-900 shadow-sm hover:bg-slate-50',
      userButtonPopoverCard: 'border border-slate-200 bg-white text-slate-900',
      userButtonPopoverActionButton: 'text-slate-800 hover:bg-slate-100',
    },
  };
}

/** Clerk SignIn/SignUp styling: dark uses @clerk/themes/dark + brand primary; light uses crisp contrast on white. */
export function buildClerkAppearance(isDark: boolean) {
  if (isDark) {
    return {
      baseTheme: dark,
      layout: {
        socialButtonsPlacement: 'top',
      },
      variables: {
        colorPrimary: '#ED353A',
        colorText: '#f4f4f5',
        colorTextSecondary: '#a1a1aa',
        colorBackground: '#0c0c0e',
        colorInputBackground: '#18181b',
        colorInputText: '#fafafa',
        colorNeutral: '#71717a',
        borderRadius: '12px',
      },
      elements: {
        cardBox:
          'shadow-[0_24px_80px_-20px_rgba(0,0,0,0.75)] rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl',
        headerTitle: 'text-zinc-50 text-xl font-semibold tracking-tight',
        headerSubtitle: 'text-zinc-400',
        socialButtonsBlockButton:
          'rounded-xl border border-zinc-600/90 bg-zinc-900/80 text-zinc-100 hover:bg-zinc-800',
        formFieldInput:
          'rounded-xl border border-zinc-600/90 bg-zinc-900/80 text-zinc-50 placeholder:text-zinc-500 focus:border-[#ED353A] focus:ring-[#ED353A]/30',
        formFieldLabel: 'text-zinc-300',
        formButtonPrimary:
          'rounded-xl bg-[#ED353A] text-white hover:bg-[#d62d32] shadow-md focus:ring-2 focus:ring-[#ED353A]/50',
        footerActionText: 'text-zinc-500',
        footerActionLink: 'text-zinc-100 hover:text-[#ED353A]',
        identityPreviewText: 'text-zinc-100',
        otpCodeFieldInput: 'rounded-xl border-zinc-600 bg-zinc-900 text-zinc-50',
        dividerLine: 'bg-zinc-700',
        dividerText: 'text-zinc-500',
        alternativeMethodsBlockButton:
          'rounded-xl border border-zinc-600/90 bg-zinc-900 text-zinc-200 hover:bg-zinc-800',
      },
    };
  }

  return {
    layout: {
      socialButtonsPlacement: 'top',
    },
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
