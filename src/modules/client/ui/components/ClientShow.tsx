import Link from 'next/link';
import { Clock, Edit, Mail, Phone, StickyNote } from 'lucide-react';
import { BackLink } from '@/components/back-link';
import { InitialsAvatar } from '@/components/initials-avatar';
import { StatusPill } from '@/components/status-pill';
import { WhatsAppAction } from '@/components/whatsapp-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { mesesDesde } from '@/lib/dates';
import { clientRoutes } from '@/modules/client/routes';
import type { ClientDto } from '@/modules/client/serializers/client.serializer';
import { ClientStatusButton } from './ClientStatusButton';

type Props = {
  companyId: string;
  client: ClientDto;
  canUpdate: boolean;
  canUpdateStatus: boolean;
};

const PRIMARY_SHADOW = 'shadow-[0_4px_12px_color-mix(in_srgb,var(--primary)_28%,transparent)]';

/** Ver: hero and the client details. Server component. */
export function ClientShow({ companyId, client, canUpdate, canUpdateStatus }: Props) {
  const tel = client.phone ?? '';
  const months = mesesDesde(client.createdAt);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-6 pb-14">
      <BackLink href={clientRoutes.index(companyId)}>Clientes</BackLink>

      <Card className="flex-row flex-wrap items-center justify-between gap-5 rounded-2xl p-5">
        <div className="flex items-center gap-[18px]">
          <InitialsAvatar name={client.name} size={64} />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight">{client.name}</h1>
              <StatusPill kind={client.status === 'inactive' ? 'inactivo' : 'activo'} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {tel && (
                <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[13.5px] font-medium">
                  <Phone className="size-3.5 opacity-80" />
                  {tel}
                </span>
              )}
              {client.email && (
                <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[13.5px] font-medium">
                  <Mail className="size-3.5 opacity-80" />
                  {client.email}
                </span>
              )}
              <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[13.5px] font-medium">
                <Clock className="size-3.5 opacity-80" />
                Cliente hace {months} mes{months !== 1 ? 'es' : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {tel && <WhatsAppAction tel={tel} />}
          {canUpdateStatus && <ClientStatusButton companyId={companyId} clientId={client.id} status={client.status} />}
          {canUpdate && (
            <Button asChild variant="outline" className="bg-card h-10 rounded-[11px] px-4 font-semibold">
              <Link href={clientRoutes.edit(companyId, client.id)}>
                <Edit />
                Editar
              </Link>
            </Button>
          )}
        </div>
      </Card>

      <div className="flex min-w-0 flex-col gap-5">
        {client.notes && (
          <Card className="gap-2 rounded-2xl px-[18px] py-4">
            <div className="text-muted-foreground flex items-center gap-2 text-[13px] font-bold">
              <StickyNote className="size-[15px]" />
              Nota
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{client.notes}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
