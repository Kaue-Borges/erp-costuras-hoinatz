import { storageKeys, storageService } from "../services/storage/storageService"
import type { Configuracoes } from "../types/entities"

export const defaultSettings: Configuracoes = { empresa: "Costuras Hoinatz", cnpj: "", turnos: "Manhã, Tarde", baixa: 70, normal: 90, boa: 110, fornecedor: "", impressora: "Padrão do navegador" }
export const configuracoesRepository = {
  async get() { return storageService.get(storageKeys.configuracoes, defaultSettings) },
  async save(settings: Configuracoes) { await storageService.set(storageKeys.configuracoes, settings); return settings },
}
