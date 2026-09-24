import { storageKeys } from "../services/storage/storageService"
import type { Cor } from "../types/entities"
import { createRepository } from "./createRepository"
export const coresRepository = createRepository<Cor>(storageKeys.cores)
