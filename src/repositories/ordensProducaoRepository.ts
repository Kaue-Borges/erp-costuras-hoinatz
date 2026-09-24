import { storageKeys } from "../services/storage/storageService"
import type { OrdemProducao } from "../types/entities"
import { createRepository } from "./createRepository"
export const ordensProducaoRepository = createRepository<OrdemProducao>(storageKeys.ordensProducao)
