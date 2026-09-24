const PREFIX = "hoinatz_erp_v1_"

export const storageKeys = {
  funcionarios: `${PREFIX}funcionarios`, fornecedores: `${PREFIX}fornecedores`, clientes: `${PREFIX}clientes`,
  produtos: `${PREFIX}produtos`, operacoes: `${PREFIX}operacoes`, cores: `${PREFIX}cores`,
  maquinas: `${PREFIX}maquinas`, turnos: `${PREFIX}turnos`, ordensProducao: `${PREFIX}ordens_producao`,
  apontamentos: `${PREFIX}apontamentos`, fichas: `${PREFIX}fichas`, notasFiscais: `${PREFIX}notas_fiscais`,
  etiquetasHistorico: `${PREFIX}etiquetas_historico`, configuracoes: `${PREFIX}configuracoes`,
} as const

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys]

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export const storageService = {
  async get<T>(key: StorageKey, fallback: T): Promise<T> {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) as T : clone(fallback)
    } catch {
      return clone(fallback)
    }
  },
  async set<T>(key: StorageKey, value: T): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value))
  },
  async remove(key: StorageKey): Promise<void> { localStorage.removeItem(key) },
  async has(key: StorageKey): Promise<boolean> { return localStorage.getItem(key) !== null },
  async exportAll(): Promise<Record<string, unknown>> {
    const data: Record<string, unknown> = { version: 1, exportedAt: new Date().toISOString() }
    for (const key of Object.values(storageKeys)) {
      const raw = localStorage.getItem(key)
      if (raw !== null) data[key] = JSON.parse(raw) as unknown
    }
    return data
  },
  async importAll(data: Record<string, unknown>): Promise<void> {
    if (data.version !== 1) throw new Error("Backup incompatível ou sem versão válida.")
    for (const key of Object.values(storageKeys)) {
      if (key in data) localStorage.setItem(key, JSON.stringify(data[key]))
    }
  },
  async clearAll(): Promise<void> {
    for (const key of Object.values(storageKeys)) localStorage.removeItem(key)
  },
}
