export type BrowserClient = {
  id?: string;
  name?: string;
  phone?: string;
  aliases?: string[];
  [key: string]: unknown;
};

export function onlyDigits(value: string | undefined) {
  return (value ?? '').replace(/[^0-9]/g, '');
}

export function normalizeBrowserRecipient(value: string) {
  const digits = onlyDigits(value);
  if (!/^\d{7,15}$/.test(digits)) throw new Response('Invalid WhatsApp recipient', { status: 400 });
  return digits;
}

function normalizeName(value: string | undefined) {
  return (value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function matchBrowserClient(title: string, clients: BrowserClient[]) {
  const normalizedTitle = normalizeName(title);
  const titleDigits = onlyDigits(title);

  for (const client of clients) {
    const names = [client.name, ...(Array.isArray(client.aliases) ? client.aliases : [])]
      .map(value => normalizeName(typeof value === 'string' ? value : ''))
      .filter(Boolean);
    const phone = onlyDigits(typeof client.phone === 'string' ? client.phone : '');

    const nameMatch = names.some(name =>
      normalizedTitle === name ||
      (normalizedTitle.length >= 4 && name.length >= 4 && (normalizedTitle.includes(name) || name.includes(normalizedTitle)))
    );
    const phoneMatch = Boolean(phone && titleDigits && (
      phone === titleDigits ||
      phone.endsWith(titleDigits.slice(-8)) ||
      titleDigits.endsWith(phone.slice(-8))
    ));

    if (nameMatch || phoneMatch) return client;
  }
  return null;
}

export function parseWhatsAppPrePlainText(meta: string) {
  const match = meta.match(/^\[(\d{1,2}):(\d{2})(?:\s*([AP]M))?,\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})\]\s*(.*?):\s*$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = (match[3] ?? '').toUpperCase();
  if (period === 'PM' && hour < 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  const day = String(Number(match[4])).padStart(2, '0');
  const month = String(Number(match[5])).padStart(2, '0');
  let year = Number(match[6]);
  if (year < 100) year += 2000;

  return {
    time: String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0'),
    date: day + '/' + month + '/' + year,
    sender: match[7].trim(),
  };
}
