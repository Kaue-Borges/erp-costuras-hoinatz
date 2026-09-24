import { EntityCrudPage, type EntityField } from "../components/cadastros/EntityCrudPage"
import { statusBadge } from "../components/ui/statusBadge"
import { clientesRepository } from "../repositories/clientesRepository"
import { notasFiscaisRepository } from "../repositories/notasFiscaisRepository"
import { produtosRepository } from "../repositories/produtosRepository"
import type { Cliente } from "../types/entities"

const statusOptions = [{ value: "Ativo", label: "Ativo" }, { value: "Inativo", label: "Inativo" }]
const fields: EntityField<Cliente>[] = [
  { key: "tipoPessoa", label: "Tipo de pessoa", type: "select", options: [{ value: "Jurídica", label: "Jurídica" }, { value: "Física", label: "Física" }] },
  { key: "razaoSocial", label: "Razão Social / Nome", required: true }, { key: "nomeFantasia", label: "Nome Fantasia" },
  { key: "cpfCnpj", label: "CPF/CNPJ" }, { key: "inscricaoEstadual", label: "Inscrição Estadual" },
  { key: "email", label: "E-mail", type: "email" }, { key: "telefone", label: "Telefone" }, { key: "whatsapp", label: "WhatsApp" },
  { key: "cep", label: "CEP" }, { key: "logradouro", label: "Logradouro" }, { key: "numero", label: "Número" },
  { key: "complemento", label: "Complemento" }, { key: "bairro", label: "Bairro" }, { key: "cidade", label: "Cidade" },
  { key: "estado", label: "Estado" }, { key: "status", label: "Status", type: "select", options: statusOptions },
  { key: "observacoes", label: "Observações", type: "textarea", full: true },
]
const empty = (): Omit<Cliente, "id" | "createdAt" | "updatedAt"> => ({ tipoPessoa: "Jurídica", razaoSocial: "", nomeFantasia: "", cpfCnpj: "", inscricaoEstadual: "", email: "", telefone: "", whatsapp: "", cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", observacoes: "", status: "Ativo" })
const digits = (value: string) => value.replace(/\D/g, "")

function ClientesPage() {
  return <EntityCrudPage title="Clientes" eyebrow="Cadastros" description="Pessoas e empresas atendidas pela Costuras Hoinatz." singular="Cliente" repository={clientesRepository} emptyValue={empty} fields={fields} searchText={(item) => `${item.razaoSocial} ${item.nomeFantasia} ${item.cpfCnpj}`} columns={[{ label: "Cliente", render: (item) => <><strong>{item.nomeFantasia || item.razaoSocial}</strong><small>{item.razaoSocial}</small></> }, { label: "CPF/CNPJ", render: (item) => item.cpfCnpj || "—" }, { label: "Contato", render: (item) => item.telefone || item.email || "—" }, { label: "Cidade", render: (item) => item.cidade || "—" }, { label: "Status", render: (item) => statusBadge(item.status) }]} validate={(value, items, id) => { if (!value.razaoSocial.trim()) return "Razão social ou nome é obrigatório."; const doc = digits(value.cpfCnpj); if (doc && items.some((item) => item.id !== id && digits(item.cpfCnpj) === doc)) return "Já existe um cliente com este CPF/CNPJ." }} canRemove={async (item) => (await produtosRepository.getAll()).some((product) => product.clienteId === item.id) || (await notasFiscaisRepository.getAll()).some((note) => note.clienteId === item.id) ? "Cliente em uso. Inative o cadastro em vez de excluir." : undefined} />
}
export default ClientesPage
