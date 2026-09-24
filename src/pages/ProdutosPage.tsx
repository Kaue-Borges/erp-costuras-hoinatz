import { useEffect, useState } from "react"
import { EntityCrudPage, type EntityField, type FieldOption } from "../components/cadastros/EntityCrudPage"
import { statusBadge } from "../components/ui/statusBadge"
import { clientesRepository } from "../repositories/clientesRepository"
import { fornecedoresRepository } from "../repositories/fornecedoresRepository"
import { notasFiscaisRepository } from "../repositories/notasFiscaisRepository"
import { ordensProducaoRepository } from "../repositories/ordensProducaoRepository"
import { produtosRepository } from "../repositories/produtosRepository"
import type { Produto } from "../types/entities"

const empty = (): Omit<Produto, "id" | "createdAt" | "updatedAt"> => ({ codigo: "", descricao: "", clienteId: "", fornecedorId: "", unidade: "UN", ncm: "", valorUnitario: 0, status: "Ativo", observacoes: "" })

function ProdutosPage() {
  const [clients, setClients] = useState<FieldOption[]>([{ value: "", label: "Sem cliente" }])
  const [suppliers, setSuppliers] = useState<FieldOption[]>([{ value: "", label: "Sem fornecedor" }])
  useEffect(() => { void Promise.all([clientesRepository.getAll(), fornecedoresRepository.getAll()]).then(([clientItems, supplierItems]) => { setClients([{ value: "", label: "Sem cliente" }, ...clientItems.map((item) => ({ value: item.id, label: item.nomeFantasia || item.razaoSocial }))]); setSuppliers([{ value: "", label: "Sem fornecedor" }, ...supplierItems.map((item) => ({ value: item.id, label: item.nomeFantasia }))]) }) }, [])
  const fields: EntityField<Produto>[] = [{ key: "codigo", label: "Código", required: true }, { key: "descricao", label: "Descrição", required: true }, { key: "clienteId", label: "Cliente", type: "select", options: clients }, { key: "fornecedorId", label: "Fornecedor", type: "select", options: suppliers }, { key: "unidade", label: "Unidade", required: true }, { key: "ncm", label: "NCM" }, { key: "valorUnitario", label: "Valor unitário", type: "number" }, { key: "status", label: "Status", type: "select", options: [{ value: "Ativo", label: "Ativo" }, { value: "Inativo", label: "Inativo" }] }, { key: "observacoes", label: "Observações", type: "textarea", full: true }]
  return <EntityCrudPage title="Produtos" eyebrow="Cadastros" description="Produtos e serviços utilizados nas ordens de produção e rascunhos fiscais." singular="Produto" repository={produtosRepository} emptyValue={empty} fields={fields} searchText={(item) => `${item.codigo} ${item.descricao} ${item.ncm}`} columns={[{ label: "Código", render: (item) => <strong>{item.codigo}</strong> }, { label: "Descrição", render: (item) => <strong>{item.descricao}</strong> }, { label: "Fornecedor", render: (item) => suppliers.find((option) => option.value === item.fornecedorId)?.label || "—" }, { label: "Unidade", render: (item) => item.unidade }, { label: "Valor", render: (item) => item.valorUnitario ? item.valorUnitario.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—" }, { label: "Status", render: (item) => statusBadge(item.status) }]} validate={(value, items, id) => { if (!value.codigo.trim() || !value.descricao.trim()) return "Código e descrição são obrigatórios."; if (items.some((item) => item.id !== id && item.codigo.toLowerCase() === value.codigo.toLowerCase())) return "Já existe um produto com este código." }} canRemove={async (item) => (await ordensProducaoRepository.getAll()).some((op) => op.produtoId === item.id) || (await notasFiscaisRepository.getAll()).some((note) => note.itens.some((line) => line.produtoId === item.id)) ? "Produto em uso. Inative o cadastro em vez de excluir." : undefined} />
}
export default ProdutosPage
