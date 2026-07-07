import { NextResponse } from 'next/server'

const INVENTORY_BASE = 'https://inventories.jailbreakchangelogs.com'
const UA = 'BeeValues-InventoryChecker/1.0'

interface RobloxUser {
  id: number
  name: string
  displayName: string
  hasVerifiedBadge?: boolean
}

async function resolveUser(query: string): Promise<RobloxUser | null> {
  // Numeric → treat as Roblox ID directly
  if (/^\d+$/.test(query)) {
    return { id: Number(query), name: query, displayName: query }
  }
  const res = await fetch(`${INVENTORY_BASE}/proxy/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
    body: JSON.stringify({ usernames: [query], excludeBannedUsers: false }),
    cache: 'no-store',
  })
  if (!res.ok) return null
  const json = (await res.json()) as { data?: RobloxUser[] }
  return json.data?.[0] ?? null
}

async function fetchAvatar(userId: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return null
    const json = (await res.json()) as {
      data?: { imageUrl?: string; state?: string }[]
    }
    const entry = json.data?.[0]
    return entry?.state === 'Completed' ? (entry.imageUrl ?? null) : null
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')?.trim()
  if (!query) {
    return NextResponse.json({ error: 'Укажите ник или Roblox ID' }, { status: 400 })
  }

  try {
    const user = await resolveUser(query)
    if (!user) {
      return NextResponse.json(
        { error: 'Игрок не найден. Проверьте ник или ID.' },
        { status: 404 },
      )
    }

    const [invRes, avatar] = await Promise.all([
      fetch(`${INVENTORY_BASE}/user?id=${user.id}`, {
        headers: { 'User-Agent': UA },
        cache: 'no-store',
      }),
      fetchAvatar(user.id),
    ])

    if (invRes.status === 404) {
      return NextResponse.json(
        {
          error: 'not_found',
          message:
            'Инвентарь этого игрока ещё не отсканирован. Данные появляются после того, как игрока встречает бот в игре.',
          user: { ...user, avatar },
        },
        { status: 404 },
      )
    }
    if (!invRes.ok) {
      return NextResponse.json(
        { error: 'Сервис инвентарей временно недоступен' },
        { status: 502 },
      )
    }

    const inventory = await invRes.json()
    return NextResponse.json({ user: { ...user, avatar }, inventory })
  } catch {
    return NextResponse.json(
      { error: 'Ошибка при получении данных. Попробуйте позже.' },
      { status: 500 },
    )
  }
}
