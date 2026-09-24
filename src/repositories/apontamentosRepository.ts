import { storageKeys } from "../services/storage/storageService"
import type { Apontamento } from "../types/entities"
import { createRepository } from "./createRepository"
export const apontamentosRepository = createRepository<Apontamento>(storageKeys.apontamentos)
