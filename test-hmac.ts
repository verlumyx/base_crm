import { createHmac } from 'crypto';

const secret = 'my-secret';
const timestamp = '1791042050';
const rawBody = '{"test": true}';
const signedPayload = `${timestamp}.${rawBody}`;

const expected = createHmac('sha256', secret)
  .update(signedPayload, 'utf8')
  .digest('hex');

console.log('Signature:', expected);
