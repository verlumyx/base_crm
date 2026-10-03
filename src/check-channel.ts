import { db } from './db/client';
import { botChannels } from './db/schema';
import { eq } from 'drizzle-orm';
import { decrypt } from './modules/shared/encryption';

async function main() {
  const channelId = '01a0cf3c-e8e3-7327-b74c-4155641f8231';
  const row = await db.query.botChannels.findFirst({
    where: eq(botChannels.id, channelId)
  });
  if (!row?.webhookSecretEncrypted) return;
  const secret = decrypt(row.webhookSecretEncrypted);
  console.log('Secret length:', secret.length);
  console.log('Secret:', secret);
  process.exit(0);
}
main().catch(console.error);
