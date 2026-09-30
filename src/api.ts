export type Topic = { id: string; title: string; subtitle: string; unit: string };
export type Progress = { attempts: number; correct: number; topics: { id: string; level: number; attempts: number }[] };
export type Exercise = { id: string; topic: string; level: number; prompt: string; formula: string; hint_used: boolean };
export type Result = { correct: boolean; expected: string; explanation: string; answer: string; level: number };

const key = 'calculo-demo-session';
let token = localStorage.getItem(key);
let initializing: Promise<void> | undefined;

export async function initialize() {
  if (token) return;
  if (!initializing) initializing = (async () => {
    const response = await fetch('/api/sessions', { method: 'POST' });
    if (!response.ok) throw new Error('No se pudo abrir la sesión. Comprueba que la API esté funcionando.');
    const data = await response.json();
    token = data.token;
    localStorage.setItem(key, data.token);
  })().finally(() => { initializing = undefined; });
  await initializing;
}

export async function api<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  await initialize();
  const response = await fetch(`/api${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 401) {
    token = null;
    localStorage.removeItem(key);
    throw new Error('La sesión caducó o se reinició la base de datos. Pulsa Reintentar para abrir otra sesión.');
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(typeof data.detail === 'string' ? data.detail : 'No se pudo completar la operación. Inténtalo nuevamente.');
  }
  return response.json();
}

export async function downloadAttempts() {
  await initialize();
  const response = await fetch('/api/export', { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('No se pudo exportar la práctica.');
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url; link.download = 'practica-demo.csv'; link.click();
  URL.revokeObjectURL(url);
}
