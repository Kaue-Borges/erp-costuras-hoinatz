import { storageKeys, storageService } from "../services/storage/storageService"
import type { FichaProducao } from "../types/entities"
import { createRepository } from "./createRepository"

const base = createRepository<FichaProducao>(storageKeys.fichas)
export const fichasRepository = {
  ...base,
  async nextNumber() {
    const next = (await base.getAll()).reduce((max, ficha) => Math.max(max, Number(ficha.numero.replace(/\D/g, "")) || 0), 0) + 1
    return `FP-${String(next).padStart(6, "0")}`
  },
  async duplicate(id: string) {
    const source = await base.getById(id)
    if (!source) throw new Error("Ficha não encontrada.")
    const numero = await this.nextNumber()
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...data } = source
    void _id; void _createdAt; void _updatedAt
    return base.create({ ...data, numero, status: "Aberta", linhas: data.linhas.map((line) => ({ ...line, id: crypto.randomUUID() })) })
  },
  async seedCounter() { return storageService.has(storageKeys.fichas) },
}
