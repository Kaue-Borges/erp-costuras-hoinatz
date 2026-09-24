import { storageKeys, storageService } from "./storageService"
import type { Cor, Fornecedor, Maquina, OperacaoCadastro, Turno } from "../../types/entities"

const createdAt = "2026-01-01T00:00:00.000Z"
const base = { createdAt, updatedAt: createdAt }

const fornecedores: Fornecedor[] = [
  { ...base, id: "fornecedor-malwee", codigo: "MALWEE", razaoSocial: "Malwee", nomeFantasia: "Malwee", cnpj: "", inscricaoEstadual: "", telefone: "", whatsapp: "", email: "", contato: "", cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", observacoes: "Fornecedor suportado pelo leitor de PDF.", status: "Ativo" },
  { ...base, id: "fornecedor-elian", codigo: "ELIAN", razaoSocial: "Elian", nomeFantasia: "Elian", cnpj: "", inscricaoEstadual: "", telefone: "", whatsapp: "", email: "", contato: "", cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", observacoes: "Fornecedor suportado pelo leitor de PDF.", status: "Ativo" },
]

const operationSeeds: Array<[string, string, OperacaoCadastro["grupo"]]> = [
  ["10", "Fechar Ombros", "OVE"], ["11", "Pregar Mangas", "OVE"], ["13", "Fechar Lados", "OVE"],
  ["20", "Pesp. Decote", "COB3 / RET"], ["28", "Travetar Bainha", "COB3 / RET"],
  ["30", "Bainha Mangas", "COB3 / RET"], ["31", "Bainha Barra", "COB3 / RET"],
  ["50", "Caseado", "CAS / BOT"], ["51", "Botão", "CAS / BOT"],
]
const operacoes: OperacaoCadastro[] = operationSeeds.map(([codigo, nome, grupo]) => ({ ...base, id: `operacao-${codigo}`, codigo, nome, grupo, maquinaId: "", descricao: "", status: "Ativo" }))
const cores: Cor[] = [
  { ...base, id: "cor-001", codigo: "001", nome: "Preto", hex: "#111111", status: "Ativo" },
  { ...base, id: "cor-002", codigo: "002", nome: "Branco", hex: "#ffffff", status: "Ativo" },
  { ...base, id: "cor-003", codigo: "003", nome: "Marinho", hex: "#17264b", status: "Ativo" },
]
const turnos: Turno[] = [{ ...base, id: "turno-manha", nome: "Manhã", horaInicio: "07:30", horaFim: "17:18", intervaloMinutos: 60, status: "Ativo" }]
const maquinas: Maquina[] = [
  { ...base, id: "maquina-overlock", codigo: "OVE-01", nome: "Overlock 01", tipo: "Overlock", marca: "", modelo: "", numeroPatrimonio: "", status: "Disponível", observacoes: "" },
  { ...base, id: "maquina-cobertura", codigo: "COB-01", nome: "Cobertura 01", tipo: "Cobertura", marca: "", modelo: "", numeroPatrimonio: "", status: "Disponível", observacoes: "" },
]

export async function seedInitialData() {
  const seeds = [
    [storageKeys.fornecedores, fornecedores], [storageKeys.operacoes, operacoes], [storageKeys.cores, cores],
    [storageKeys.turnos, turnos], [storageKeys.maquinas, maquinas],
  ] as const
  for (const [key, data] of seeds) {
    if (!await storageService.has(key)) await storageService.set(key, data)
  }
}
