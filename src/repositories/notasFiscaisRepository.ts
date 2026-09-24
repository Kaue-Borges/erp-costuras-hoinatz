import { storageKeys } from "../services/storage/storageService"
import type { NotaFiscal } from "../types/entities"
import { createRepository } from "./createRepository"
export const notasFiscaisRepository = createRepository<NotaFiscal>(storageKeys.notasFiscais)
