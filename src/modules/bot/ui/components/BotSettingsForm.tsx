'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FormSectionHead } from '@/components/form-section-head';
import { cn } from '@/lib/utils';
import { useBotSettingsFormContext } from '../contexts/BotSettingsFormContext';

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-bad text-sm">{messages[0]}</p>;
}

function Toggle({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[10px] border p-4">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-[13px] font-semibold">
          {label}
        </Label>
        <p className="text-muted-foreground mt-0.5 text-[13px]">{hint}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} className="mt-0.5 shrink-0" />
    </div>
  );
}

function NumberField({
  id,
  name,
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step = 1,
  error,
}: {
  id: string;
  name: string;
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  error?: string[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-[13px] font-semibold">
        {label}
      </Label>
      <Input
        id={id}
        name={name}
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className={cn('h-[42px] rounded-[10px]', error && 'border-bad')}
        required
      />
      {hint && <p className="text-muted-foreground text-[13px]">{hint}</p>}
      <FieldError messages={error} />
    </div>
  );
}

export function BotSettingsForm() {
  const { data, setData, formAction, pending, errors, settings } = useBotSettingsFormContext();

  return (
    <form action={formAction} className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1fr_320px]">
      {/* The switches are rendered by Radix, which does not submit a native input. */}
      <input type="hidden" name="status" value={data.enabled ? 'active' : 'inactive'} />
      <input type="hidden" name="handoffEnabled" value={data.handoffEnabled ? 'on' : ''} />
      <input type="hidden" name="autoCreateClient" value={data.autoCreateClient ? 'on' : ''} />

      <div className="flex min-w-0 flex-col gap-5">
        <Card className="gap-0 overflow-hidden rounded-2xl py-0">
          <FormSectionHead step={1} title="Asistente" sub="Identidad y propósito del asistente" />
          <div className="flex flex-col gap-4 p-5">
            <Toggle
              id="enabled"
              label="Asistente activo"
              hint="Mientras esté inactivo, los mensajes entrantes se guardan pero nadie responde automáticamente."
              checked={data.enabled}
              onChange={(v) => setData('enabled', v)}
            />

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assistantName" className="text-[13px] font-semibold">
                Nombre del asistente *
              </Label>
              <Input
                id="assistantName"
                name="assistantName"
                value={data.assistantName}
                onChange={(e) => setData('assistantName', e.target.value)}
                placeholder="Ej. Sofía"
                maxLength={100}
                className={cn('h-[42px] rounded-[10px]', errors.assistantName && 'border-bad')}
                required
              />
              <FieldError messages={errors.assistantName} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="systemPrompt" className="text-[13px] font-semibold">
                Propósito del asistente
              </Label>
              <Textarea
                id="systemPrompt"
                name="systemPrompt"
                value={data.systemPrompt}
                onChange={(e) => setData('systemPrompt', e.target.value)}
                placeholder="Ej. Atiendes consultas sobre nuestros servicios y agendas citas con los especialistas disponibles. Pregunta siempre el nombre y el motivo de la consulta."
                rows={6}
                maxLength={8000}
                className={cn('rounded-[10px]', errors.systemPrompt && 'border-bad')}
              />
              <p className="text-muted-foreground text-[13px]">
                Define qué hace el asistente y cómo debe comportarse. Se añade al inicio del prompt de sistema. Déjalo vacío para un asistente de atención general.
              </p>
              <FieldError messages={errors.systemPrompt} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="personaPrompt" className="text-[13px] font-semibold">
                Instrucciones del negocio
              </Label>
              <Textarea
                id="personaPrompt"
                name="personaPrompt"
                value={data.personaPrompt}
                onChange={(e) => setData('personaPrompt', e.target.value)}
                placeholder="Ej. Trata de tú y habla de forma cercana."
                rows={4}
                maxLength={4000}
                className={cn('rounded-[10px]', errors.personaPrompt && 'border-bad')}
              />
              <p className="text-muted-foreground text-[13px]">
                Preferencias sobre el trato y el estilo (tuteo, formalidad, despedida). Se añaden al final del prompt, por debajo de las reglas de seguridad.
              </p>
              <FieldError messages={errors.personaPrompt} />
            </div>
          </div>
        </Card>

        <Card className="gap-0 overflow-hidden rounded-2xl py-0">
          <FormSectionHead step={2} title="Automatización" sub="Qué puede hacer el bot por su cuenta" />
          <div className="flex flex-col gap-4 p-5">
            <Toggle
              id="autoCreateClient"
              label="Registrar clientes nuevos"
              hint="Si el contacto no existe en el CRM, el bot puede crearlo con su nombre y teléfono."
              checked={data.autoCreateClient}
              onChange={(v) => setData('autoCreateClient', v)}
            />
            <Toggle
              id="handoffEnabled"
              label="Permitir escalar a un humano"
              hint="El bot puede ceder la conversación cuando el cliente lo pide o no sabe resolver."
              checked={data.handoffEnabled}
              onChange={(v) => setData('handoffEnabled', v)}
            />
            <NumberField
              id="handoffMinutes"
              name="handoffMinutes"
              label="Minutos de atención humana"
              hint="Pasado este tiempo sin actividad del agente, el bot retoma la conversación."
              value={data.handoffMinutes}
              onChange={(v) => setData('handoffMinutes', v)}
              min={5}
              max={1440}
              error={errors.handoffMinutes}
            />
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-5">
        <Card className="gap-0 overflow-hidden rounded-2xl py-0">
          <FormSectionHead step={3} title="Motor" sub="Ajustes finos del modelo" />
          <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="chatModel" className="text-[13px] font-semibold">
                Modelo de chat *
              </Label>
              <Input
                id="chatModel"
                name="chatModel"
                value={data.chatModel}
                onChange={(e) => setData('chatModel', e.target.value)}
                maxLength={60}
                className={cn('h-[42px] rounded-[10px]', errors.chatModel && 'border-bad')}
                required
              />
              <FieldError messages={errors.chatModel} />
            </div>

            <NumberField
              id="temperature"
              name="temperature"
              label="Temperatura"
              hint="0 = respuestas más consistentes. Valores más altos = más variedad."
              value={data.temperature}
              onChange={(v) => setData('temperature', v)}
              min={0}
              max={2}
              step={0.1}
              error={errors.temperature}
            />
            <NumberField
              id="retrievalTopK"
              name="retrievalTopK"
              label="Fragmentos de conocimiento"
              value={data.retrievalTopK}
              onChange={(v) => setData('retrievalTopK', v)}
              min={1}
              max={20}
              error={errors.retrievalTopK}
            />
            <NumberField
              id="retrievalMinScore"
              name="retrievalMinScore"
              label="Similitud mínima"
              hint="Por debajo de este valor el fragmento se descarta por irrelevante."
              value={data.retrievalMinScore}
              onChange={(v) => setData('retrievalMinScore', v)}
              min={0}
              max={1}
              step={0.05}
              error={errors.retrievalMinScore}
            />
            <NumberField
              id="historyWindow"
              name="historyWindow"
              label="Mensajes de historial"
              value={data.historyWindow}
              onChange={(v) => setData('historyWindow', v)}
              min={2}
              max={100}
              error={errors.historyWindow}
            />
            <NumberField
              id="maxToolIterations"
              name="maxToolIterations"
              label="Máximo de herramientas por turno"
              value={data.maxToolIterations}
              onChange={(v) => setData('maxToolIterations', v)}
              min={1}
              max={12}
              error={errors.maxToolIterations}
            />
            <NumberField
              id="contactDailyMessageLimit"
              name="contactDailyMessageLimit"
              label="Límite diario por contacto"
              hint="Tope de mensajes que el bot responde a un mismo número en 24 horas."
              value={data.contactDailyMessageLimit}
              onChange={(v) => setData('contactDailyMessageLimit', v)}
              min={1}
              max={5000}
              error={errors.contactDailyMessageLimit}
            />
          </div>
        </Card>

        <Button type="submit" disabled={pending} className="h-[42px] rounded-[10px]">
          <Check className="size-4" />
          {pending ? 'Guardando…' : 'Guardar configuración'}
        </Button>
      </div>
    </form>
  );
}
