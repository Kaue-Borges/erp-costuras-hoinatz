import { storageKeys } from "../services/storage/storageService"
import type { OperacaoCadastro } from "../types/entities"
import { createRepository } from "./createRepository"
export const operacoesRepository = createRepository<OperacaoCadastro>(storageKeys.operacoes)
