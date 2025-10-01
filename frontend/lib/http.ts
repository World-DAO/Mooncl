export async function getJSON<T>(path: string, init?: RequestInit): Promise<T> {
    const base = process.env.NEXT_PUBLIC_API_BASE || '';
    const res = await fetch(`${base}${path}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      ...init,
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const data = await res.json();
        msg = (data as any)?.message || msg;
      } catch {}
      throw new Error(msg);
    }
    return (await res.json()) as T;
  }