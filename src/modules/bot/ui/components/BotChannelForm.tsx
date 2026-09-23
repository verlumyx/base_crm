'use client';

import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Switch } from '@/components/ui/switch';
import { FormSectionHead } from '@/components/form-section-head';
import { cn } from '@/lib/utils';
import { botRoutes } from '@/modules/bot/routes';
import { useBotChannelFormContext } from '../contexts/BotChannelFormContext';

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-bad text-sm">{messages[0]}</p>;
}

function SecretField({
  id,
  label,
  hint,
  stored,
  value,
  onChange,
  error,
  required,
}: {
  id: string;
  label: string;
  hint: string;
  stored: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string[];
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-[13px] font-semibold">
        {label}
        {required && ' *'}
      </Label>
      <Input
        id={id}
        name={id}
        type="password"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={stored ? 'Guardado — escribe solo si quieres cambiarlo' : ''}
        className={cn('h-[42px] rounded-[10px] font-mono', error && 'border-bad')}
        required={required && !stored}
      />
      <p className="text-muted-foreground text-[13px]">{hint}</p>
      <FieldError messages={error} />
    </div>
  );
}

export function BotChannelForm({ companyId, webhookUrl }: { companyId: string; webhookUrl: string | null }) {
  const router = useRouter();
  const { mode, data, setData, formAction, pending, errors, channel } = useBotChannelFormContext();
  const isWhatsApp = data.provider === 'whatsapp';

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {mode === 'create' && (
        <>
          <input type="hidden" name="id" value={data.id} />
          <input type="hidden" name="provider" value={data.provider} />
        </>
      )}
      <input type="hidden" name="status" value={data.active ? 'active' : 'inactive'} />

      <Card className="gap-0 overflow-hidden rounded-2xl py-0">
        <FormSectionHead step={1} title="Canal" sub="Por dónde te escriben los clientes" />
        <div className="flex flex-col gap-4 p-5">
          {mode === 'create' && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="provider" className="text-[13px] font-semibold">
                Plataforma *
              </Label>
              <SearchableSelect
                id="provider"
                options={[
                  { value: 'whatsapp', label: 'WhatsApp (YCloud)' },
                  { value: 'telegram', label: 'Telegram' },
                ]}
                value={data.provider}
                onChange={(value) => value && setData('provider', value as typeof data.provider)}
                placeholder="Plataforma"
                emptyText="Sin resultados"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="displayName" className="text-[13px] font-semibold">
              Nombre *
            </Label>
            <Input
              id="displayName"
              name="displayName"
              value={data.displayName}
              onChange={(e) => setData('displayName', e.target.value)}
              placeholder={isWhatsApp ? 'Ej. Ventas +58 412 1234567' : 'Ej. @mi_bot_de_ventas'}
              maxLength={100}
              className={cn('h-[42px] rounded-[10px]', errors.displayName && 'border-bad')}
              required
            />
            <p className="text-muted-foreground text-[13px]">
              {isWhatsApp
                ? 'Es el nombre que el asistente usa para presentarse como la empresa.'
                : 'Si lo dejas vacío se usará el @usuario del bot.'}
            </p>
            <FieldError messages={errors.displayName} />
          </div>

          {isWhatsApp && mode === 'create' && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="externalId" className="text-[13px] font-semibold">
                Número de WhatsApp (E.164) *
              </Label>
              <Input
                id="externalId"
                name="externalId"
                value={data.externalId}
                onChange={(e) => setData('externalId', e.target.value)}
                placeholder="+584121234567"
                maxLength={64}
                className={cn('h-[42px] rounded-[10px] font-mono', errors.externalId && 'border-bad')}
                required
              />
              <p className="text-muted-foreground text-[13px]">
                Tu número de teléfono conectado en la plataforma de YCloud.
              </p>
              <FieldError messages={errors.externalId} />
            </div>
          )}

          <div className="flex items-start justify-between gap-4 rounded-[10px] border p-4">
            <div className="min-w-0">
              <Label htmlFor="active" className="text-[13px] font-semibold">
                Canal activo
              </Label>
              <p className="text-muted-foreground mt-0.5 text-[13px]">
                Mientras esté inactivo, el webhook rechaza los mensajes entrantes de este número.
              </p>
            </div>
            <Switch
              id="active"
              checked={data.active}
              onCheckedChange={(value) => setData('active', value)}
              className="mt-0.5 shrink-0"
            />
          </div>
        </div>
      </Card>

      <Card className="gap-0 overflow-hidden rounded-2xl py-0">
        <FormSectionHead step={2} title="Credenciales" sub="Se guardan cifradas y nunca se vuelven a mostrar" />
        <div className="flex flex-col gap-4 p-5">
          <SecretField
            id="accessToken"
            label={isWhatsApp ? 'API Key de YCloud' : 'Token del bot'}
            hint={
              isWhatsApp
                ? 'En YCloud Console → Settings → API Keys.'
                : 'El token que te dio @BotFather.'
            }
            stored={Boolean(channel?.hasAccessToken)}
            value={data.accessToken}
            onChange={(value) => setData('accessToken', value)}
            error={errors.accessToken}
            required={mode === 'create'}
          />

          {isWhatsApp && (
            <>
              <SecretField
                id="webhookSecret"
                label="Webhook Signing Secret"
                hint="En YCloud Console → Developers → Webhooks (formato whsec_...). Verifica la autenticidad de los mensajes."
                stored={Boolean(channel?.hasWebhookSecret)}
                value={data.webhookSecret}
                onChange={(value) => setData('webhookSecret', value)}
                error={errors.webhookSecret}
                required={mode === 'create'}
              />
              <input type="hidden" name="graphApiVersion" value="v2" />
            </>
          )}
        </div>
      </Card>

      {webhookUrl && (
        <Card className="gap-0 overflow-hidden rounded-2xl py-0">
          <FormSectionHead step={3} title="Webhook" sub="Dónde recibe los mensajes este canal" />
          <div className="flex flex-col gap-3 p-5">
            <code className="bg-muted overflow-x-auto rounded-[10px] p-3 text-[13px]">{webhookUrl}</code>
            {isWhatsApp ? (
              <p className="text-muted-foreground text-[13px]">
                Pégala en <strong>YCloud Console → Developers → Webhooks</strong>, copia el <strong>Signing Secret</strong> en el campo de arriba y suscribe los eventos{' '}
                <strong>whatsapp.inbound_message.received</strong> y <strong>whatsapp.message.updated</strong>.
              </p>
            ) : (
              <p className="text-muted-foreground text-[13px]">
                Se registra automáticamente al guardar. Si cambias la URL pública de la app, vuelve a registrarlo.
              </p>
            )}
          </div>
        </Card>
      )}

      <div className="flex justify-end gap-2.5">
        <Button
          type="button"
          variant="outline"
          className="h-[42px] rounded-[10px]"
          onClick={() => router.push(botRoutes.channels(companyId))}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={pending} className="h-[42px] rounded-[10px]">
          <Check className="size-4" />
          {pending ? 'Guardando…' : mode === 'create' ? 'Conectar canal' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
