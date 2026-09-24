import { storageKeys } from "../services/storage/storageService"
import type { EtiquetaHistorico } from "../types/entities"
import { createRepository } from "./createRepository"
export const etiquetasHistoricoRepository = createRepository<EtiquetaHistorico>(storageKeys.etiquetasHistorico)
