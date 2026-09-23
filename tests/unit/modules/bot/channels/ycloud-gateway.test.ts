import { describe, expect, it, vi } from 'vitest';
import { createHmac } from 'node:crypto';
import {
  ChannelSendError,
  YCloudChannelGateway,
} from '@/modules/bot/channels/whatsapp/ycloud.gateway';
import type { ChannelCredentials } from '@/modules/bot/channels/channel-gateway';

const SECRET = 'whsec_test_secret_123';
const API_KEY = 'api_key_test_xyz';

const credentials: ChannelCredentials = {
  externalId: '+15550783881',
  accessToken: API_KEY,
  appSecret: null,
  verifyToken: null,
  webhookSecret: SECRET,
  apiVersion: 'v2',
};

describe('YCloudChannelGateway', () => {
  const gateway = new YCloudChannelGateway();

  describe('parse', () => {
    it('parses incoming text message (whatsapp.inbound_message.received)', () => {
      const payload = {
        id: 'evt_123',
        type: 'whatsapp.inbound_message.received',
        apiVersion: 'v2',
        createTime: '2026-03-20T12:00:00.000Z',
        whatsappInboundMessage: {
          id: '63f872f6741c165b4342a751',
          wamid: 'wamid.HBgMNTg0MTIxMjM0NTY3FQIAEhgUM0E0QkQ0',
          from: '+584121234567',
          to: '+15550783881',
          type: 'text',
          text: { body: 'Hola, necesito soporte' },
          customerProfile: { name: 'Camila Rojas' },
          sendTime: '2026-03-20T12:00:00.000Z',
        },
      };

      const result = gateway.parse(payload);

      expect(result.statuses).toHaveLength(0);
      expect(result.messages).toHaveLength(1);

      const msg = result.messages[0];
      expect(msg.provider).toBe('whatsapp');
      expect(msg.eventId).toBe('wamid.HBgMNTg0MTIxMjM0NTY3FQIAEhgUM0E0QkQ0');
      expect(msg.channelExternalId).toBe('+15550783881');
      expect(msg.contactExternalId).toBe('+584121234567');
      expect(msg.phoneE164).toBe('+584121234567');
      expect(msg.contactName).toBe('Camila Rojas');
      expect(msg.text).toBe('Hola, necesito soporte');
      expect(msg.kind).toBe('text');
      expect(msg.sentAt).toBe('2026-03-20T12:00:00.000Z');
    });

    it('parses interactive button replies as text', () => {
      const payload = {
        type: 'whatsapp.inbound_message.received',
        whatsappInboundMessage: {
          id: 'msg_btn_1',
          from: '+584121234567',
          type: 'interactive',
          interactive: {
            type: 'button_reply',
            buttonReply: { id: 'btn_yes', title: 'Sí, quiero contratar' },
          },
        },
      };

      const result = gateway.parse(payload);
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].text).toBe('Sí, quiero contratar');
      expect(result.messages[0].kind).toBe('text');
    });

    it('flags non-text media (e.g. image, audio) as unsupported', () => {
      const payload = {
        type: 'whatsapp.inbound_message.received',
        whatsappInboundMessage: {
          id: 'msg_img_1',
          from: '+584121234567',
          type: 'image',
        },
      };

      const result = gateway.parse(payload);
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].text).toBeNull();
      expect(result.messages[0].kind).toBe('unsupported');
    });

    it('parses delivery statuses (whatsapp.message.updated)', () => {
      const payloadDelivered = {
        type: 'whatsapp.message.updated',
        whatsappMessage: {
          id: 'msg_1',
          wamid: 'wamid.123',
          status: 'delivered',
        },
      };
      const resultDelivered = gateway.parse(payloadDelivered);
      expect(resultDelivered.statuses).toEqual([
        { externalMessageId: 'wamid.123', status: 'delivered', error: null },
      ]);

      const payloadFailed = {
        type: 'whatsapp.message.updated',
        whatsappMessage: {
          id: 'msg_2',
          wamid: 'wamid.456',
          status: 'failed',
          errorCode: '131047',
          errorMessage: 'Re-engagement message needed',
        },
      };
      const resultFailed = gateway.parse(payloadFailed);
      expect(resultFailed.statuses).toEqual([
        {
          externalMessageId: 'wamid.456',
          status: 'failed',
          error: '131047: Re-engagement message needed',
        },
      ]);
    });

    it('handles multiple events in an array', () => {
      const payload = [
        {
          type: 'whatsapp.inbound_message.received',
          whatsappInboundMessage: {
            id: 'msg_1',
            from: '+584121111111',
            type: 'text',
            text: { body: 'Mensaje 1' },
          },
        },
        {
          type: 'whatsapp.message.updated',
          whatsappMessage: {
            wamid: 'wamid.2',
            status: 'read',
          },
        },
      ];

      const result = gateway.parse(payload);
      expect(result.messages).toHaveLength(1);
      expect(result.statuses).toHaveLength(1);
      expect(result.messages[0].text).toBe('Mensaje 1');
      expect(result.statuses[0].status).toBe('delivered');
    });

    it('returns empty collections for unknown or empty payloads', () => {
      expect(gateway.parse(null)).toEqual({ messages: [], statuses: [] });
      expect(gateway.parse({})).toEqual({ messages: [], statuses: [] });
      expect(gateway.parse({ type: 'other.event' })).toEqual({ messages: [], statuses: [] });
    });
  });

  describe('verify', () => {
    it('verifies valid official YCloud-Signature with correct HMAC', () => {
      const rawBody = JSON.stringify({ type: 'whatsapp.inbound_message.received' });
      const timestamp = '1720000000';
      const signedPayload = `${timestamp}.${rawBody}`;
      const signature = createHmac('sha256', SECRET).update(signedPayload, 'utf8').digest('hex');

      const headers = new Headers({
        'YCloud-Signature': `t=${timestamp},s=${signature}`,
      });

      expect(gateway.verify({ rawBody, headers }, credentials)).toBe(true);
    });

    it('verifies valid X-YCloud-Signature with correct HMAC', () => {
      const rawBody = JSON.stringify({ type: 'whatsapp.inbound_message.received' });
      const timestamp = '1720000000';
      const signedPayload = `${timestamp}.${rawBody}`;
      const signature = createHmac('sha256', SECRET).update(signedPayload, 'utf8').digest('hex');

      const headers = new Headers({
        'x-ycloud-signature': `t=${timestamp},s=${signature}`,
      });

      expect(gateway.verify({ rawBody, headers }, credentials)).toBe(true);
    });

    it('rejects tampered body or incorrect signature', () => {
      const rawBody = JSON.stringify({ type: 'whatsapp.inbound_message.received' });
      const timestamp = '1720000000';
      const signature = createHmac('sha256', SECRET).update(`tampered`, 'utf8').digest('hex');

      const headers = new Headers({
        'x-ycloud-signature': `t=${timestamp},s=${signature}`,
      });

      expect(gateway.verify({ rawBody, headers }, credentials)).toBe(false);
    });

    it('rejects missing header or missing secret', () => {
      const rawBody = '{}';
      const headers = new Headers();

      expect(gateway.verify({ rawBody, headers }, credentials)).toBe(false);
      expect(
        gateway.verify(
          { rawBody, headers: new Headers({ 'x-ycloud-signature': 't=1,s=abc' }) },
          { ...credentials, webhookSecret: null },
        ),
      ).toBe(false);
    });
  });

  describe('send', () => {
    it('sends text message and returns external message id', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: '63f872f6741c165b4342a751',
          wamid: 'wamid.HBgMNTg0MTIxMjM0NTY3',
          status: 'accepted',
        }),
      });

      vi.stubGlobal('fetch', fetchMock);

      const result = await gateway.send('+584121234567', 'Hola cliente', credentials);

      expect(result.externalMessageId).toBe('wamid.HBgMNTg0MTIxMjM0NTY3');
      expect(fetchMock).toHaveBeenCalledWith('https://api.ycloud.com/v2/whatsapp/messages/sendDirectly', {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '+15550783881',
          to: '+584121234567',
          type: 'text',
          text: { body: 'Hola cliente' },
        }),
      });

      vi.unstubAllGlobals();
    });

    it('identifies 24-hour service window errors correctly', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: {
            message: 'Message failed: recipient is outside the 24 hours customer service window.',
            code: 131047,
          },
        }),
      });

      vi.stubGlobal('fetch', fetchMock);

      await expect(gateway.send('+584121234567', 'Hola', credentials)).rejects.toMatchObject({
        outsideServiceWindow: true,
        retryable: false,
        httpStatus: 400,
      });

      vi.unstubAllGlobals();
    });
  });
});
