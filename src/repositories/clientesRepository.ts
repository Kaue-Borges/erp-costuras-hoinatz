import { storageKeys } from "../services/storage/storageService"
import type { Cliente } from "../types/entities"
import { createRepository } from "./createRepository"
export const clientesRepository = createRepository<Cliente>(storageKeys.clientes)
