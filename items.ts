export interface JBItem {
  id: number
  name: string
  type: string
  creator: string
  is_seasonal: 0 | 1
  cash_value: string
  duped_value: string
  price: string
  is_limited: 0 | 1
  notes: string
  demand: string
  description: string
  tradable: 0 | 1
  last_updated: number
  trend: string | null
  metadata?: {
    TimesTraded?: number
    UniqueCirculation?: number
    DemandMultiple?: number
  }
}

export const CATEGORIES: { type: string; label: string; folder: string }[] = [
  { type: 'Vehicle', label: 'Машины', folder: 'vehicles' },
  { type: 'HyperChrome', label: 'ХайперХромы', folder: 'hyperchromes' },
  { type: 'Rim', label: 'Колёса', folder: 'rims' },
  { type: 'Spoiler', label: 'Спойлеры', folder: 'spoilers' },
  { type: 'Body Color', label: 'Цвета кузова', folder: 'body colors' },
  { type: 'Texture', label: 'Текстуры', folder: 'textures' },
  { type: 'Tire Sticker', label: 'Наклейки шин', folder: 'tire stickers' },
  { type: 'Tire Style', label: 'Стили шин', folder: 'tire styles' },
  { type: 'Drift', label: 'Дрифты', folder: 'drifts' },
  { type: 'Furniture', label: 'Мебель', folder: 'furnitures' },
  { type: 'Horn', label: 'Гудки', folder: 'horns' },
  { type: 'Weapon Skin', label: 'Скины оружия', folder: 'weapon skins' },
]

export function categoryLabel(type: string): string {
  return CATEGORIES.find((c) => c.type === type)?.label ?? type
}

export function itemImageUrl(item: Pick<JBItem, 'name' | 'type'>): string {
  const folder =
    CATEGORIES.find((c) => c.type === item.type)?.folder ??
    `${item.type.toLowerCase()}s`
  return `https://assets.jailbreakchangelogs.com/assets/images/items/480p/${encodeURIComponent(
    folder,
  )}/${encodeURIComponent(item.name)}.webp`
}

/** Parse values like "500k", "1.2m", "N/A" into numbers */
export function parseValue(raw: string | null | undefined): number {
  if (!raw || raw === 'N/A') return 0
  const s = raw.trim().toLowerCase().replace(/,/g, '')
  const m = s.match(/^([\d.]+)\s*([kmb])?$/)
  if (!m) return 0
  const n = Number.parseFloat(m[1])
  if (Number.isNaN(n)) return 0
  const mult = m[2] === 'b' ? 1e9 : m[2] === 'm' ? 1e6 : m[2] === 'k' ? 1e3 : 1
  return Math.round(n * mult)
}

export function formatValue(n: number): string {
  if (n <= 0) return '—'
  if (n >= 1e9) return `${trimNum(n / 1e9)}B`
  if (n >= 1e6) return `${trimNum(n / 1e6)}M`
  if (n >= 1e3) return `${trimNum(n / 1e3)}K`
  return String(n)
}

function trimNum(n: number): string {
  const s = n.toFixed(2)
  return s.replace(/\.?0+$/, '')
}

const DEMAND_ORDER = [
  "close to none",
  'low',
  'medium',
  'decent',
  'high',
  'very high',
  'extremely high',
]

export function demandRank(demand: string | null | undefined): number {
  if (!demand || demand === 'N/A') return -1
  return DEMAND_ORDER.indexOf(demand.toLowerCase())
}

export const DEMAND_LABELS_RU: Record<string, string> = {
  'close to none': 'Почти нет',
  low: 'Низкий',
  medium: 'Средний',
  decent: 'Умеренный',
  high: 'Высокий',
  'very high': 'Очень высокий',
  'extremely high': 'Максимальный',
}

export function demandLabel(demand: string | null | undefined): string {
  if (!demand || demand === 'N/A') return '—'
  return DEMAND_LABELS_RU[demand.toLowerCase()] ?? demand
}

export const TREND_LABELS_RU: Record<string, string> = {
  stable: 'Стабильно',
  rising: 'Растёт',
  hyped: 'Хайп',
  dropping: 'Падает',
  avoided: 'Избегают',
  unstable: 'Нестабильно',
  fluctuating: 'Колеблется',
  hoarded: 'Скупают',
  projected: 'Прогноз',
  recovering: 'Восстанавливается',
}

export type TrendDirection = 'up' | 'down' | 'flat'

export function trendDirection(trend: string | null | undefined): TrendDirection {
  const t = (trend ?? '').toLowerCase()
  if (['rising', 'hyped', 'hoarded', 'recovering'].includes(t)) return 'up'
  if (['dropping', 'avoided', 'unstable'].includes(t)) return 'down'
  return 'flat'
}

export function trendLabel(trend: string | null | undefined): string {
  if (!trend) return 'Стабильно'
  return TREND_LABELS_RU[trend.toLowerCase()] ?? trend
}
