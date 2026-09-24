import { EntityCrudPage, type EntityField } from "../components/cadastros/EntityCrudPage"
import { statusBadge } from "../components/ui/statusBadge"
import { fornecedoresRepository } from "../repositories/fornecedoresRepository"
import { ordensProducaoRepository } from "../repositories/ordensProducaoRepository"
import { produtosRepository } from "../repositories/produtosRepository"
import type { Fornecedor } from "../types/entities"

const fields: EntityField<Fornecedor>[] = [
  { key: "codigo", label: "Código", required: true }, { key: "razaoSocial", label: "Razão Social", required: true },
  { key: "nomeFantasia", label: "Nome Fantasia", required: true }, { key: "cnpj", label: "CNPJ" },
  { key: "inscricaoEstadual", label: "Inscrição Estadual" }, { key: "telefone", label: "Telefone" },
  { key: "whatsapp", label: "WhatsApp" }, { key: "email", label: "E-mail", type: "email" },
  { key: "contato", label: "Contato" }, { key: "cep", label: "CEP" }, { key: "logradouro", label: "Logradouro" },
  { key: "numero", label: "Número" }, { key: "complemento", label: "Complemento" }, { key: "bairro", label: "Bairro" },
  { key: "cidade", label: "Cidade" }, { key: "estado", label: "Estado" },
  { key: "status", label: "Status", type: "select", options: [{ value: "Ativo", label: "Ativo" }, { value: "Inativo", label: "Inativo" }] },
  { key: "observacoes", label: "Observações", type: "textarea", full: true },
]
const empty = (): Omit<Fornecedor, "id" | "createdAt" | "updatedAt"> => ({ codigo: "", razaoSocial: "", nomeFantasia: "", cnpj: "", inscricaoEstadual: "", telefone: "", whatsapp: "", email: "", contato: "", cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", observacoes: "", status: "Ativo" })
const digits = (value: string) => value.replace(/\D/g, "")

function FornecedoresPage() {
  return <EntityCrudPage title="Fornecedores" eyebrow="Cadastros" description="Parceiros comerciais e fornecedores atendidos pela confecção." singular="Fornecedor" repository={fornecedoresRepository} emptyValue={empty} fields={fields} searchText={(item) => `${item.codigo} ${item.nomeFantasia} ${item.razaoSocial} ${item.cnpj}`} columns={[{ label: "Código", render: (item) => <strong>{item.codigo}</strong> }, { label: "Fornecedor", render: (item) => <><strong>{item.nomeFantasia}</strong><small>{item.razaoSocial}</small></> }, { label: "CNPJ", render: (item) => item.cnpj || "—" }, { label: "Contato", render: (item) => item.contato || item.telefone || "—" }, { label: "Status", render: (item) => statusBadge(item.status) }]} validate={(value, items, id) => { if (!value.codigo.trim() || !value.nomeFantasia.trim() || !value.razaoSocial.trim()) return "Código, razão social e nome fantasia são obrigatórios."; if (items.some((item) => item.id !== id && item.codigo.toLowerCase() === value.codigo.toLowerCase())) return "Já existe um fornecedor com este código."; const doc = digits(value.cnpj); if (doc && items.some((item) => item.id !== id && digits(item.cnpj) === doc)) return "Já existe um fornecedor com este CNPJ." }} canRemove={async (item) => (await ordensProducaoRepository.getAll()).some((op) => op.fornecedorId === item.id) || (await produtosRepository.getAll()).some((produto) => produto.fornecedorId === item.id) ? "Fornecedor em uso. Inative o cadastro em vez de excluir." : undefined} />
}
export default FornecedoresPage
