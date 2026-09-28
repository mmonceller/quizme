import type { ReactNode } from 'react';
import { Logo } from '@/components/layout/Logo';
import { IconClipboard, IconClock, IconPeople, type IconComponent } from '@/components/icons';

const FEATURES: { icon: IconComponent; title: string; text: string }[] = [
  { icon: IconClipboard, title: 'Seven question types', text: 'From multiple choice to matching and sequencing.' },
  { icon: IconClock, title: 'Timed or self-paced', text: 'Countdowns, answer reveals, and presentation mode.' },
  { icon: IconPeople, title: 'Share and collect', text: 'Public links with scored, versioned responses.' },
];

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden overflow-hidden bg-brand-900 px-12 py-10 text-white lg:flex lg:flex-col">
        <Logo light />
        <svg
          viewBox="0 0 400 400"
          fill="none"
          aria-hidden
          className="pointer-events-none absolute -right-28 -top-28 h-[420px] w-[420px] text-white/[0.07]"
        >
          {[60, 110, 160, 200].map((r) => (
            <circle key={r} cx="200" cy="200" r={r} stroke="currentColor" strokeWidth="1" />
          ))}
        </svg>
        <div className="mt-auto max-w-md">
          <h2 className="font-serif text-5xl leading-[1.05]">
            Quizzes, crafted with <em className="text-brand-300">care</em>.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-white/65">
            Create, present, and share quizzes for classrooms, teams, and game nights.
          </p>
          <ul className="mt-10 space-y-5 border-t border-white/10 pt-8">
            {FEATURES.map(({ icon: Icon, title: t, text }) => (
              <li key={t} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 text-brand-200">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <div className="text-sm font-medium">{t}</div>
                  <div className="mt-0.5 text-sm text-white/55">{text}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <h1 className="font-serif text-4xl text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
