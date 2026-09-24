import { storageKeys } from "../services/storage/storageService"
import type { Produto } from "../types/entities"
import { createRepository } from "./createRepository"
export const produtosRepository = createRepository<Produto>(storageKeys.produtos)
