import { storageKeys } from "../services/storage/storageService"
import type { Funcionario } from "../types/entities"
import { createRepository } from "./createRepository"
export const funcionariosRepository = createRepository<Funcionario>(storageKeys.funcionarios)
