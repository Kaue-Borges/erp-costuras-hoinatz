import { EntityCrudPage, type EntityField } from "../components/cadastros/EntityCrudPage"
import { statusBadge } from "../components/ui/statusBadge"
import { apontamentosRepository } from "../repositories/apontamentosRepository"
import { coresRepository } from "../repositories/coresRepository"
import { ordensProducaoRepository } from "../repositories/ordensProducaoRepository"
import type { Cor } from "../types/entities"

const fields: EntityField<Cor>[] = [{ key: "codigo", label: "Código", required: true }, { key: "nome", label: "Nome", required: true }, { key: "hex", label: "Cor de referência", type: "color" }, { key: "status", label: "Status", type: "select", options: [{ value: "Ativo", label: "Ativo" }, { value: "Inativo", label: "Inativo" }] }]
const empty = (): Omit<Cor, "id" | "createdAt" | "updatedAt"> => ({ codigo: "", nome: "", hex: "#000000", status: "Ativo" })

function CoresPage() {
  return <EntityCrudPage title="Cores" eyebrow="Cadastros" description="Catálogo padronizado de cores utilizado nas ordens e apontamentos." singular="Cor" repository={coresRepository} emptyValue={empty} fields={fields} searchText={(item) => `${item.codigo} ${item.nome}`} columns={[{ label: "Código", render: (item) => <strong>{item.codigo}</strong> }, { label: "Cor", render: (item) => <span className="color-label"><i style={{ background: item.hex || "transparent" }} />{item.nome}</span> }, { label: "Status", render: (item) => statusBadge(item.status) }]} validate={(value, items, id) => { if (!value.codigo.trim() || !value.nome.trim()) return "Código e nome são obrigatórios."; if (items.some((item) => item.id !== id && item.codigo.toLowerCase() === value.codigo.toLowerCase())) return "Já existe uma cor com este código." }} canRemove={async (item) => (await ordensProducaoRepository.getAll()).some((op) => op.corId === item.id) || (await apontamentosRepository.getAll()).some((entry) => entry.corId === item.id) ? "Cor em uso. Inative o cadastro em vez de excluir." : undefined} />
}
export default CoresPage
