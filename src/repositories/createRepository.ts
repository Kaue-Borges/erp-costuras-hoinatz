import { storageService, type StorageKey } from "../services/storage/storageService"
import type { BaseEntity } from "../types/entities"

export type CreateInput<T extends BaseEntity> = Omit<T, "id" | "createdAt" | "updatedAt">
export type UpdateInput<T extends BaseEntity> = Partial<CreateInput<T>>

export interface Repository<T extends BaseEntity> {
  getAll(): Promise<T[]>; getById(id: string): Promise<T | undefined>
  create(data: CreateInput<T>): Promise<T>; update(id: string, data: UpdateInput<T>): Promise<T>
  remove(id: string): Promise<void>; toggleStatus(id: string, activeStatus?: string, inactiveStatus?: string): Promise<T>
}

export function createRepository<T extends BaseEntity>(key: StorageKey): Repository<T> {
  async function getAll() { return storageService.get<T[]>(key, []) }
  return {
    getAll,
    async getById(id) { return (await getAll()).find((item) => item.id === id) },
    async create(data) {
      const now = new Date().toISOString()
      const item = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now } as T
      await storageService.set(key, [...await getAll(), item])
      return item
    },
    async update(id, data) {
      let updated: T | undefined
      const items = (await getAll()).map((item) => {
        if (item.id !== id) return item
        updated = { ...item, ...data, id, updatedAt: new Date().toISOString() }
        return updated
      })
      if (!updated) throw new Error("Registro não encontrado.")
      await storageService.set(key, items)
      return updated
    },
    async remove(id) { await storageService.set(key, (await getAll()).filter((item) => item.id !== id)) },
    async toggleStatus(id, activeStatus = "Ativo", inactiveStatus = "Inativo") {
      const item = await this.getById(id)
      if (!item || !("status" in item)) throw new Error("Registro não encontrado.")
      const current = String((item as T & { status: string }).status)
      return this.update(id, { status: current === inactiveStatus ? activeStatus : inactiveStatus } as unknown as UpdateInput<T>)
    },
  }
}
