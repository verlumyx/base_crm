import type { Metadata } from 'next';
import Link from 'next/link';
import { getSessionUser } from '@/modules/shared/auth/session';
import { AppLogo } from '@/components/app-logo';

export const metadata: Metadata = {
  title: { absolute: 'ValolabsCRM — Tu negocio, bajo control.' },
};

export default async function HomePage() {
  const user = await getSessionUser();
  const panelHref = user ? '/dashboard' : '/login';
  const panelLabel = user ? 'Ir al panel' : 'Iniciar sesión';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="mb-8">
        <AppLogo />
      </div>
      <h1 className="mb-4 text-4xl font-bold">Bienvenido a ValolabsCRM</h1>
      <p className="mb-8 text-lg text-muted-foreground">Tu CRM genérico y asistente virtual.</p>
      <Link href={panelHref} className="btn btn-brand btn-lg">
        {panelLabel}
      </Link>
    </div>
  );
}
