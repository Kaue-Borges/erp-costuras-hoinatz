export function formatDate(date: string) {
  if (!date) return "—"
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`))
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

export function todayInputValue() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export function isToday(value: string) {
  return new Date(value).toDateString() === new Date().toDateString()
}

export function isWithinDays(value: string, days: number) {
  const timestamp = new Date(value).getTime()
  const start = new Date().setHours(0, 0, 0, 0) - (days - 1) * 86_400_000
  return timestamp >= start
}
