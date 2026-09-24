import { useEffect, useMemo, useState } from "react"
import { Badge } from "../components/ui/Badge"
import { Card } from "../components/ui/Card"
import { EmptyState } from "../components/ui/EmptyState"
import { PageHeader } from "../components/ui/PageHeader"
import { apontamentosRepository } from "../repositories/apontamentosRepository"
import { funcionariosRepository } from "../repositories/funcionariosRepository"
import { operacoesRepository } from "../repositories/operacoesRepository"
import { ordensProducaoRepository } from "../repositories/ordensProducaoRepository"
import type { Apontamento, Funcionario, OperacaoCadastro, OrdemProducao } from "../types/entities"
import { formatPercent, isToday } from "../utils/formatters"
import { classificarEficiencia } from "../utils/producao"

function ProducaoPage() {
  const [entries, setEntries] = useState<Apontamento[]>([]); const [employees, setEmployees] = useState<Funcionario[]>([]); const [orders, setOrders] = useState<OrdemProducao[]>([]); const [operations, setOperations] = useState<OperacaoCadastro[]>([])
  useEffect(() => { void Promise.all([apontamentosRepository.getAll(), funcionariosRepository.getAll(), ordensProducaoRepository.getAll(), operacoesRepository.getAll()]).then(([a, b, c, d]) => { setEntries(a.filter((item) => isToday(item.createdAt))); setEmployees(b); setOrders(c); setOperations(d) }) }, [])
  const maps = useMemo(() => ({ employees: new Map(employees.map((item) => [item.id, item.nome])), orders: new Map(orders.map((item) => [item.id, item.numero])), operations: new Map(operations.map((item) => [item.id, item.nome])) }), [employees, orders, operations])
  return <div className="page-stack"><PageHeader eyebrow="Chão de fábrica" title="Produção atual" description="Apontamentos reais registrados no turno de hoje." />{entries.length === 0 ? <Card><EmptyState title="Nenhuma produção registrada hoje" description="Os apontamentos lançados aparecerão automaticamente aqui." /></Card> : <div className="production-grid">{entries.map((item) => { const classification = classificarEficiencia(item.eficiencia); return <Card className="production-card" key={item.id}><div className="production-head"><div className="avatar">{maps.employees.get(item.funcionarioId)?.[0] ?? "?"}</div><div><h3>{maps.employees.get(item.funcionarioId) ?? "Cadastro removido"}</h3><span>OP {maps.orders.get(item.opId) ?? "—"}</span></div><Badge tone={classification.tone}>{formatPercent(item.eficiencia)}</Badge></div><div className="operation-name">{maps.operations.get(item.operacaoId) ?? "Operação removida"}</div><div className="production-stats"><div><span>Meta/h</span><strong>{item.metaPecasHora}</strong></div><div><span>Produzido</span><strong>{item.quantidade}</strong></div><div><span>Tempo</span><strong>{item.tempoMinutos} min</strong></div></div><div className="progress-track"><i style={{ width: `${Math.min(item.eficiencia, 100)}%` }} /></div></Card> })}</div>}</div>
}
export default ProducaoPage
