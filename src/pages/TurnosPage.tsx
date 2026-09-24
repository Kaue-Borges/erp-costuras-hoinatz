import { EntityCrudPage, type EntityField } from "../components/cadastros/EntityCrudPage"
import { statusBadge } from "../components/ui/statusBadge"
import { fichasRepository } from "../repositories/fichasRepository"
import { funcionariosRepository } from "../repositories/funcionariosRepository"
import { turnosRepository } from "../repositories/turnosRepository"
import type { Turno } from "../types/entities"

const fields: EntityField<Turno>[] = [{ key: "nome", label: "Nome", required: true }, { key: "horaInicio", label: "Hora inicial", type: "time", required: true }, { key: "horaFim", label: "Hora final", type: "time", required: true }, { key: "intervaloMinutos", label: "Intervalo (minutos)", type: "number" }, { key: "status", label: "Status", type: "select", options: [{ value: "Ativo", label: "Ativo" }, { value: "Inativo", label: "Inativo" }] }]
const empty = (): Omit<Turno, "id" | "createdAt" | "updatedAt"> => ({ nome: "", horaInicio: "", horaFim: "", intervaloMinutos: 0, status: "Ativo" })

function TurnosPage() {
  return <EntityCrudPage title="Turnos" eyebrow="Cadastros" description="Horários de trabalho utilizados pela equipe e pelas fichas." singular="Turno" repository={turnosRepository} emptyValue={empty} fields={fields} searchText={(item) => item.nome} columns={[{ label: "Turno", render: (item) => <strong>{item.nome}</strong> }, { label: "Início", render: (item) => item.horaInicio }, { label: "Fim", render: (item) => item.horaFim }, { label: "Intervalo", render: (item) => `${item.intervaloMinutos} min` }, { label: "Status", render: (item) => statusBadge(item.status) }]} validate={(value, items, id) => { if (!value.nome.trim() || !value.horaInicio || !value.horaFim) return "Nome e horários são obrigatórios."; if (items.some((item) => item.id !== id && item.nome.toLowerCase() === value.nome.toLowerCase())) return "Já existe um turno com este nome." }} canRemove={async (item) => (await funcionariosRepository.getAll()).some((employee) => employee.turnoId === item.id) || (await fichasRepository.getAll()).some((sheet) => sheet.turnoId === item.id) ? "Turno em uso. Inative o cadastro em vez de excluir." : undefined} />
}
export default TurnosPage
