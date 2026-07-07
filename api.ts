import type { JBItem } from './items'

const API_BASE = 'https://api.jailbreakchangelogs.com'

export async function fetchItems(): Promise<JBItem[]> {
  const res = await fetch(`${API_BASE}/items/list`, {
    next: { revalidate: 300 },
    headers: { 'User-Agent': 'BeeValues/1.0' },
  })
  if (!res.ok) throw new Error(`Items API error: ${res.status}`)
  const data = (await res.json()) as JBItem[]
  return data.filter((i) => i && i.name && i.type)
}
