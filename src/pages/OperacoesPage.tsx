import { useEffect, useState } from "react"
import { EntityCrudPage, type EntityField, type FieldOption } from "../components/cadastros/EntityCrudPage"
import { statusBadge } from "../components/ui/statusBadge"
import { apontamentosRepository } from "../repositories/apontamentosRepository"
import { fichasRepository } from "../repositories/fichasRepository"
import { funcionariosRepository } from "../repositories/funcionariosRepository"
import { maquinasRepository } from "../repositories/maquinasRepository"
import { operacoesRepository } from "../repositories/operacoesRepository"
import type { OperacaoCadastro } from "../types/entities"

const empty = (): Omit<OperacaoCadastro, "id" | "createdAt" | "updatedAt"> => ({ codigo: "", nome: "", grupo: "Outro", maquinaId: "", descricao: "", status: "Ativo" })

function OperacoesPage() {
  const [machines, setMachines] = useState<FieldOption[]>([{ value: "", label: "Sem máquina vinculada" }])
  useEffect(() => { void maquinasRepository.getAll().then((items) => setMachines([{ value: "", label: "Sem máquina vinculada" }, ...items.map((item) => ({ value: item.id, label: `${item.codigo} — ${item.nome}` }))])) }, [])
  const fields: EntityField<OperacaoCadastro>[] = [{ key: "codigo", label: "Código", required: true }, { key: "nome", label: "Nome", required: true }, { key: "grupo", label: "Grupo", type: "select", options: ["OVE", "COB3 / RET", "CAS / BOT", "Outro"].map((value) => ({ value, label: value })) }, { key: "maquinaId", label: "Máquina padrão", type: "select", options: machines }, { key: "status", label: "Status", type: "select", options: [{ value: "Ativo", label: "Ativo" }, { value: "Inativo", label: "Inativo" }] }, { key: "descricao", label: "Descrição", type: "textarea", full: true }]
  return <EntityCrudPage title="Operações" eyebrow="Cadastros" description="Cadastro administrativo de operações; independente das regras atuais dos parsers de PDF." singular="Operação" repository={operacoesRepository} emptyValue={empty} fields={fields} searchText={(item) => `${item.codigo} ${item.nome} ${item.grupo}`} columns={[{ label: "Código", render: (item) => <strong>{item.codigo}</strong> }, { label: "Operação", render: (item) => <strong>{item.nome}</strong> }, { label: "Grupo", render: (item) => item.grupo }, { label: "Máquina", render: (item) => machines.find((machine) => machine.value === item.maquinaId)?.label || "—" }, { label: "Status", render: (item) => statusBadge(item.status) }]} validate={(value, items, id) => { if (!value.codigo.trim() || !value.nome.trim()) return "Código e nome são obrigatórios."; if (items.some((item) => item.id !== id && item.codigo.toLowerCase() === value.codigo.toLowerCase())) return "Já existe uma operação com este código." }} canRemove={async (item) => (await funcionariosRepository.getAll()).some((employee) => employee.operacoesHabilitadas.includes(item.id)) || (await apontamentosRepository.getAll()).some((entry) => entry.operacaoId === item.id) || (await fichasRepository.getAll()).some((sheet) => sheet.linhas.some((line) => line.operacaoId === item.id)) ? "Operação em uso. Inative o cadastro em vez de excluir." : undefined} />
}
export default OperacoesPage
