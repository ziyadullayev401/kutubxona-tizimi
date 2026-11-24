// Backend bilan ishlash uchun yordamchi funksiyalar (fetch API)
async function sorov(url, { method = 'GET', body } = {}) {
  const javob = await fetch('/api' + url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const malumot = javob.status === 204 ? null : await javob.json().catch(() => null);
  if (!javob.ok) throw new Error(malumot?.xato || `Server xatosi (${javob.status})`);
  return malumot;
}

export const api = {
  olish: (url) => sorov(url),
  qoshish: (url, body) => sorov(url, { method: 'POST', body }),
  yangilash: (url, body) => sorov(url, { method: 'PUT', body: body ?? {} }),
  ochirish: (url) => sorov(url, { method: 'DELETE' }),
};

// "2026-11-24" -> "24.11.2026"
export function sana(s) {
  if (!s) return '—';
  const [y, m, d] = s.split('-');
  return `${d}.${m}.${y}`;
}
