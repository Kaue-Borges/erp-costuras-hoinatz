import { storageKeys } from "../services/storage/storageService"
import type { Fornecedor } from "../types/entities"
import { createRepository } from "./createRepository"
export const fornecedoresRepository = createRepository<Fornecedor>(storageKeys.fornecedores)
