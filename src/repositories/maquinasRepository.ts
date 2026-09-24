import { storageKeys } from "../services/storage/storageService"
import type { Maquina } from "../types/entities"
import { createRepository } from "./createRepository"
export const maquinasRepository = createRepository<Maquina>(storageKeys.maquinas)
