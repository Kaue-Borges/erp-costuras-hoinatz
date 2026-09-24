import { storageKeys } from "../services/storage/storageService"
import type { Turno } from "../types/entities"
import { createRepository } from "./createRepository"
export const turnosRepository = createRepository<Turno>(storageKeys.turnos)
