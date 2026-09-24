import { EntityCrudPage, type EntityField } from "../components/cadastros/EntityCrudPage"
import { statusBadge } from "../components/ui/statusBadge"
import { funcionariosRepository } from "../repositories/funcionariosRepository"
import { maquinasRepository } from "../repositories/maquinasRepository"
import { operacoesRepository } from "../repositories/operacoesRepository"
import type { Maquina } from "../types/entities"

const fields: EntityField<Maquina>[] = [{ key: "codigo", label: "Código", required: true }, { key: "nome", label: "Nome", required: true }, { key: "tipo", label: "Tipo", type: "select", options: ["Overlock", "Reta", "Cobertura", "Caseadeira", "Botoneira", "Galoneira", "Outros"].map((value) => ({ value, label: value })) }, { key: "marca", label: "Marca" }, { key: "modelo", label: "Modelo" }, { key: "numeroPatrimonio", label: "Número de patrimônio" }, { key: "status", label: "Status", type: "select", options: ["Disponível", "Em uso", "Manutenção", "Inativa"].map((value) => ({ value, label: value })) }, { key: "observacoes", label: "Observações", type: "textarea", full: true }]
const empty = (): Omit<Maquina, "id" | "createdAt" | "updatedAt"> => ({ codigo: "", nome: "", tipo: "Overlock", marca: "", modelo: "", numeroPatrimonio: "", status: "Disponível", observacoes: "" })

function MaquinasPage() {
  return <EntityCrudPage title="Máquinas" eyebrow="Cadastros" description="Parque fabril, situação e capacidades disponíveis." singular="Máquina" repository={maquinasRepository} emptyValue={empty} fields={fields} statusOptions={["Disponível", "Em uso", "Manutenção", "Inativa"]} searchText={(item) => `${item.codigo} ${item.nome} ${item.tipo} ${item.numeroPatrimonio}`} columns={[{ label: "Código", render: (item) => <strong>{item.codigo}</strong> }, { label: "Máquina", render: (item) => <><strong>{item.nome}</strong><small>{item.tipo}</small></> }, { label: "Marca / Modelo", render: (item) => `${item.marca} ${item.modelo}`.trim() || "—" }, { label: "Patrimônio", render: (item) => item.numeroPatrimonio || "—" }, { label: "Status", render: (item) => statusBadge(item.status) }]} validate={(value, items, id) => { if (!value.codigo.trim() || !value.nome.trim()) return "Código e nome são obrigatórios."; if (items.some((item) => item.id !== id && item.codigo.toLowerCase() === value.codigo.toLowerCase())) return "Já existe uma máquina com este código." }} canRemove={async (item) => (await funcionariosRepository.getAll()).some((employee) => employee.maquinasHabilitadas.includes(item.id)) || (await operacoesRepository.getAll()).some((operation) => operation.maquinaId === item.id) ? "Máquina em uso. Altere seu status em vez de excluir." : undefined} />
}
export default MaquinasPage
