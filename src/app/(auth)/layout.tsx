import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './auth.css';

export const metadata: Metadata = {
  title: { template: '%s — ValolabsCRM', default: 'ValolabsCRM' },
};

/** Toasts come from the single global `<Toaster />` in the root layout; mounting another one duplicates them. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}
