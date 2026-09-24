import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { EmptyState } from "../components/ui/EmptyState"
import { Feedback } from "../components/ui/Feedback"
import { Input, Select } from "../components/ui/FormField"
import { Modal } from "../components/ui/Modal"
import { PageHeader } from "../components/ui/PageHeader"
import { Table } from "../components/ui/Table"
import { apontamentosRepository } from "../repositories/apontamentosRepository"
import { clientesRepository } from "../repositories/clientesRepository"
import { coresRepository } from "../repositories/coresRepository"
import { fichasRepository } from "../repositories/fichasRepository"
import { fornecedoresRepository } from "../repositories/fornecedoresRepository"
import { ordensProducaoRepository } from "../repositories/ordensProducaoRepository"
import { produtosRepository } from "../repositories/produtosRepository"
import type { Cliente, Cor, Fornecedor, OrdemProducao, OrdemStatus, Produto } from "../types/entities"
import { formatDate, todayInputValue } from "../utils/formatters"

type OrderForm = Omit<OrdemProducao, "id" | "createdAt" | "updatedAt">
const empty = (): OrderForm => ({ numero: "", fornecedorId: "", clienteId: "", produtoId: "", corId: "", quantidade: 0, dataEntrada: todayInputValue(), dataPrevista: "", dataInicio: "", dataFim: "", status: "Pendente", observacoes: "" })
const statuses: OrdemStatus[] = ["Pendente", "Em Produção", "Pausada", "Finalizada", "Cancelada"]

function tone(status: OrdemStatus) { return status === "Finalizada" ? "success" as const : status === "Em Produção" ? "info" as const : status === "Pausada" ? "warning" as const : status === "Cancelada" ? "danger" as const : "neutral" as const }

function OrdensProducaoPage() {
  const [orders, setOrders] = useState<OrdemProducao[]>([])
  const [suppliers, setSuppliers] = useState<Fornecedor[]>([])
  const [clients, setClients] = useState<Cliente[]>([])
  const [products, setProducts] = useState<Produto[]>([])
  const [colors, setColors] = useState<Cor[]>([])
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState("")
  const [form, setForm] = useState<OrderForm>(empty); const [editingId, setEditingId] = useState<string>()
  const [viewing, setViewing] = useState<OrdemProducao>(); const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState({ message: "", tone: "success" as "success" | "error" })

  async function load() { const [a, b, c, d, e] = await Promise.all([ordensProducaoRepository.getAll(), fornecedoresRepository.getAll(), clientesRepository.getAll(), produtosRepository.getAll(), coresRepository.getAll()]); setOrders(a); setSuppliers(b); setClients(c); setProducts(d); setColors(e) }
  useEffect(() => {
    let active = true
    void Promise.all([ordensProducaoRepository.getAll(), fornecedoresRepository.getAll(), clientesRepository.getAll(), produtosRepository.getAll(), coresRepository.getAll()]).then(([a, b, c, d, e]) => {
      if (!active) return
      setOrders(a); setSuppliers(b); setClients(c); setProducts(d); setColors(e)
    })
    return () => { active = false }
  }, [])
  const supplierMap = useMemo(() => new Map(suppliers.map((item) => [item.id, item.nomeFantasia])), [suppliers])
  const productMap = useMemo(() => new Map(products.map((item) => [item.id, item.descricao])), [products])
  const colorMap = useMemo(() => new Map(colors.map((item) => [item.id, item.nome])), [colors])
  const filtered = orders.filter((item) => (!query || `${item.numero} ${supplierMap.get(item.fornecedorId)} ${productMap.get(item.produtoId)}`.toLowerCase().includes(query.toLowerCase())) && (!filter || item.status === filter))

  function newOrder() { setEditingId(undefined); setForm(empty()); setOpen(true) }
  function edit(item: OrdemProducao) { const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...data } = item; void _id; void _createdAt; void _updatedAt; setEditingId(item.id); setForm(data); setOpen(true) }
  async function save(event: FormEvent) { event.preventDefault(); if (!form.numero.trim() || !form.fornecedorId || !form.produtoId || form.quantidade <= 0) { setFeedback({ message: "Número, fornecedor, produto e quantidade maior que zero são obrigatórios.", tone: "error" }); return } if (orders.some((item) => item.id !== editingId && item.numero.toLowerCase() === form.numero.toLowerCase())) { setFeedback({ message: "Já existe uma OP com este número.", tone: "error" }); return } if (editingId) await ordensProducaoRepository.update(editingId, form); else await ordensProducaoRepository.create(form); await load(); setOpen(false); setFeedback({ message: `OP ${editingId ? "atualizada" : "criada"} com sucesso.`, tone: "success" }) }
  async function remove(item: OrdemProducao) { const used = (await apontamentosRepository.getAll()).some((entry) => entry.opId === item.id) || (await fichasRepository.getAll()).some((sheet) => sheet.opId === item.id); if (used) { setFeedback({ message: "OP possui registros relacionados e não pode ser excluída. Altere o status.", tone: "error" }); return } if (!window.confirm(`Excluir a OP ${item.numero}?`)) return; await ordensProducaoRepository.remove(item.id); await load(); setFeedback({ message: "OP excluída.", tone: "success" }) }

  return <div className="page-stack"><PageHeader eyebrow="Planejamento" title="Ordens de Produção" description="Controle das OPs relacionado aos cadastros centrais." actions={<Button onClick={newOrder}>+ Nova OP</Button>} /><Feedback {...feedback} /><Card className="filter-bar"><Input label="Pesquisar" placeholder="Número, produto ou fornecedor" value={query} onChange={(e) => setQuery(e.target.value)} /><Select label="Status" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">Todos</option>{statuses.map((status) => <option key={status}>{status}</option>)}</Select></Card>{filtered.length === 0 ? <Card><EmptyState title="Nenhuma OP encontrada" description="Cadastre uma ordem após criar fornecedor, produto e cor." /></Card> : <Card><Table><thead><tr><th>OP</th><th>Fornecedor / Produto</th><th>Cor</th><th>Quantidade</th><th>Previsão</th><th>Status</th><th>Ações</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><strong>#{item.numero}</strong></td><td><strong>{productMap.get(item.produtoId) || "Cadastro removido"}</strong><small>{supplierMap.get(item.fornecedorId) || "Cadastro removido"}</small></td><td>{colorMap.get(item.corId) || "—"}</td><td>{item.quantidade.toLocaleString("pt-BR")}</td><td>{formatDate(item.dataPrevista)}</td><td><Badge tone={tone(item.status)}>{item.status}</Badge></td><td><div className="table-actions"><button onClick={() => setViewing(item)}>Visualizar</button><button onClick={() => edit(item)}>Editar</button><button className="danger-link" onClick={() => void remove(item)}>Excluir</button></div></td></tr>)}</tbody></Table></Card>}{open ? <Modal title={editingId ? "Editar OP" : "Nova OP"} onClose={() => setOpen(false)}><form className="modal-form" onSubmit={(event) => void save(event)}><div className="form-grid"><Input required label="Número da OP" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} /><Select required label="Fornecedor" value={form.fornecedorId} onChange={(e) => setForm({ ...form, fornecedorId: e.target.value })}><option value="">Selecione</option>{suppliers.filter((item) => item.status === "Ativo").map((item) => <option value={item.id} key={item.id}>{item.nomeFantasia}</option>)}</Select><Select label="Cliente" value={form.clienteId} onChange={(e) => setForm({ ...form, clienteId: e.target.value })}><option value="">Sem cliente</option>{clients.filter((item) => item.status === "Ativo").map((item) => <option value={item.id} key={item.id}>{item.nomeFantasia || item.razaoSocial}</option>)}</Select><Select required label="Produto" value={form.produtoId} onChange={(e) => setForm({ ...form, produtoId: e.target.value })}><option value="">Selecione</option>{products.filter((item) => item.status === "Ativo").map((item) => <option value={item.id} key={item.id}>{item.codigo} — {item.descricao}</option>)}</Select><Select label="Cor" value={form.corId} onChange={(e) => setForm({ ...form, corId: e.target.value })}><option value="">Selecione</option>{colors.filter((item) => item.status === "Ativo").map((item) => <option value={item.id} key={item.id}>{item.codigo} — {item.nome}</option>)}</Select><Input required type="number" min="1" label="Quantidade" value={form.quantidade || ""} onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })} /><Input type="date" label="Data de entrada" value={form.dataEntrada} onChange={(e) => setForm({ ...form, dataEntrada: e.target.value })} /><Input type="date" label="Data prevista" value={form.dataPrevista} onChange={(e) => setForm({ ...form, dataPrevista: e.target.value })} /><Input type="date" label="Data de início" value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} /><Input type="date" label="Data de fim" value={form.dataFim} onChange={(e) => setForm({ ...form, dataFim: e.target.value })} /><Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as OrdemStatus })}>{statuses.map((status) => <option key={status}>{status}</option>)}</Select></div><label className="ui-field"><span>Observações</span><textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></label><div className="modal-actions"><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit">Salvar OP</Button></div></form></Modal> : null}{viewing ? <Modal title={`OP ${viewing.numero}`} onClose={() => setViewing(undefined)}><dl className="detail-grid"><div><dt>Fornecedor</dt><dd>{supplierMap.get(viewing.fornecedorId)}</dd></div><div><dt>Produto</dt><dd>{productMap.get(viewing.produtoId)}</dd></div><div><dt>Cor</dt><dd>{colorMap.get(viewing.corId) || "—"}</dd></div><div><dt>Quantidade</dt><dd>{viewing.quantidade}</dd></div><div><dt>Status</dt><dd>{viewing.status}</dd></div><div><dt>Observações</dt><dd>{viewing.observacoes || "—"}</dd></div></dl></Modal> : null}</div>
}
export default OrdensProducaoPage
