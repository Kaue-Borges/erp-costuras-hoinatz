import { useEffect, useState } from "react"
import { EntityCrudPage, type EntityField, type FieldOption } from "../components/cadastros/EntityCrudPage"
import { statusBadge } from "../components/ui/statusBadge"
import { apontamentosRepository } from "../repositories/apontamentosRepository"
import { fichasRepository } from "../repositories/fichasRepository"
import { funcionariosRepository } from "../repositories/funcionariosRepository"
import { maquinasRepository } from "../repositories/maquinasRepository"
import { operacoesRepository } from "../repositories/operacoesRepository"
import { turnosRepository } from "../repositories/turnosRepository"
import type { Apontamento, Funcionario } from "../types/entities"

const empty = (): Omit<Funcionario, "id" | "createdAt" | "updatedAt"> => ({ matricula: "", nome: "", cpf: "", dataNascimento: "", telefone: "", cargo: "Costureira", funcao: "Costureira", turnoId: "", dataAdmissao: "", status: "Ativo", observacoes: "", operacoesHabilitadas: [], maquinasHabilitadas: [] })
const digits = (value: string) => value.replace(/\D/g, "")

function efficiency(entries: Apontamento[], employeeId: string) {
  const own = entries.filter((entry) => entry.funcionarioId === employeeId)
  const expected = own.reduce((sum, entry) => sum + entry.producaoEsperada, 0)
  return expected > 0 ? own.reduce((sum, entry) => sum + entry.quantidade, 0) / expected * 100 : 0
}

function FuncionariosPage() {
  const [turnos, setTurnos] = useState<FieldOption[]>([{ value: "", label: "Selecione" }])
  const [operations, setOperations] = useState<FieldOption[]>([])
  const [machines, setMachines] = useState<FieldOption[]>([])
  const [entries, setEntries] = useState<Apontamento[]>([])
  useEffect(() => { void Promise.all([turnosRepository.getAll(), operacoesRepository.getAll(), maquinasRepository.getAll(), apontamentosRepository.getAll()]).then(([shiftItems, operationItems, machineItems, pointingItems]) => { setTurnos([{ value: "", label: "Selecione" }, ...shiftItems.map((item) => ({ value: item.id, label: item.nome }))]); setOperations(operationItems.map((item) => ({ value: item.id, label: `${item.codigo} — ${item.nome}` }))); setMachines(machineItems.map((item) => ({ value: item.id, label: `${item.codigo} — ${item.nome}` }))); setEntries(pointingItems) }) }, [])
  const fields: EntityField<Funcionario>[] = [{ key: "matricula", label: "Matrícula", required: true }, { key: "nome", label: "Nome", required: true }, { key: "cpf", label: "CPF" }, { key: "dataNascimento", label: "Data de nascimento", type: "date" }, { key: "telefone", label: "Telefone" }, { key: "cargo", label: "Cargo" }, { key: "funcao", label: "Função", required: true }, { key: "turnoId", label: "Turno", type: "select", options: turnos }, { key: "dataAdmissao", label: "Data de admissão", type: "date" }, { key: "status", label: "Status", type: "select", options: ["Ativo", "Inativo", "Afastado", "Férias"].map((value) => ({ value, label: value })) }, { key: "operacoesHabilitadas", label: "Operações habilitadas", type: "multiselect", options: operations, full: true }, { key: "maquinasHabilitadas", label: "Máquinas habilitadas", type: "multiselect", options: machines, full: true }, { key: "observacoes", label: "Observações", type: "textarea", full: true }]
  return <EntityCrudPage title="Funcionários e Costureiras" eyebrow="Equipe" description="Cadastro da equipe, turnos e competências produtivas." singular="Funcionário" repository={funcionariosRepository} emptyValue={empty} fields={fields} statusOptions={["Ativo", "Inativo", "Afastado", "Férias"]} searchText={(item) => `${item.matricula} ${item.nome} ${item.funcao} ${item.cpf}`} columns={[{ label: "Matrícula", render: (item) => <strong>{item.matricula}</strong> }, { label: "Funcionário", render: (item) => <><strong>{item.nome}</strong><small>{item.funcao}</small></> }, { label: "Turno", render: (item) => turnos.find((option) => option.value === item.turnoId)?.label || "—" }, { label: "Status", render: (item) => statusBadge(item.status) }, { label: "Eficiência recente", render: (item) => { const value = efficiency(entries, item.id); return value ? `${Math.round(value)}%` : "Sem dados" } }]} validate={(value, items, id) => { if (!value.matricula.trim() || !value.nome.trim() || !value.funcao.trim()) return "Matrícula, nome e função são obrigatórios."; if (items.some((item) => item.id !== id && item.matricula.toLowerCase() === value.matricula.toLowerCase())) return "Já existe uma funcionária com esta matrícula."; const cpf = digits(value.cpf); if (cpf && items.some((item) => item.id !== id && digits(item.cpf) === cpf)) return "Já existe uma funcionária com este CPF." }} canRemove={async (item) => (await apontamentosRepository.getAll()).some((entry) => entry.funcionarioId === item.id) || (await fichasRepository.getAll()).some((sheet) => sheet.funcionarioId === item.id) ? "Funcionário possui registros. Inative o cadastro em vez de excluir." : undefined} />
}
export default FuncionariosPage
