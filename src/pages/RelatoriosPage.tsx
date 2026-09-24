/* eslint-disable no-useless-assignment -- grouping branches overwrite both discriminator values */
import { useEffect, useMemo, useState } from "react"
import { Card } from "../components/ui/Card"
import { EmptyState } from "../components/ui/EmptyState"
import { Input, Select } from "../components/ui/FormField"
import { PageHeader } from "../components/ui/PageHeader"
import { Table } from "../components/ui/Table"
import { apontamentosRepository } from "../repositories/apontamentosRepository"
import { fornecedoresRepository } from "../repositories/fornecedoresRepository"
import { funcionariosRepository } from "../repositories/funcionariosRepository"
import { operacoesRepository } from "../repositories/operacoesRepository"
import { ordensProducaoRepository } from "../repositories/ordensProducaoRepository"
import type { Apontamento, Fornecedor, Funcionario, OperacaoCadastro, OrdemProducao } from "../types/entities"
import { formatPercent, isToday, isWithinDays } from "../utils/formatters"

type Period = "Hoje" | "7 dias" | "30 dias" | "Personalizado"
type Report = "Funcionário" | "OP" | "Operação" | "Fornecedor" | "Produção diária"

function RelatoriosPage() {
  const [period, setPeriod] = useState<Period>("Hoje"); const [report, setReport] = useState<Report>("Funcionário"); const [from, setFrom] = useState(""); const [to, setTo] = useState("")
  const [entries, setEntries] = useState<Apontamento[]>([]); const [employees, setEmployees] = useState<Funcionario[]>([]); const [orders, setOrders] = useState<OrdemProducao[]>([]); const [operations, setOperations] = useState<OperacaoCadastro[]>([]); const [suppliers, setSuppliers] = useState<Fornecedor[]>([])
  useEffect(() => { void Promise.all([apontamentosRepository.getAll(), funcionariosRepository.getAll(), ordensProducaoRepository.getAll(), operacoesRepository.getAll(), fornecedoresRepository.getAll()]).then(([a, b, c, d, e]) => { setEntries(a); setEmployees(b); setOrders(c); setOperations(d); setSuppliers(e) }) }, [])
  const filtered = entries.filter((item) => { if (period === "Hoje") return isToday(item.createdAt); if (period === "7 dias") return isWithinDays(item.createdAt, 7); if (period === "30 dias") return isWithinDays(item.createdAt, 30); const date = item.createdAt.slice(0, 10); return (!from || date >= from) && (!to || date <= to) })
  const maps = useMemo(() => ({ employees: new Map(employees.map((item) => [item.id, item.nome])), orders: new Map(orders.map((item) => [item.id, item])), operations: new Map(operations.map((item) => [item.id, item.nome])), suppliers: new Map(suppliers.map((item) => [item.id, item.nomeFantasia])) }), [employees, operations, orders, suppliers])
  const rows = useMemo(() => { const grouped = new Map<string, { label: string; quantity: number; minutes: number; expected: number }>(); for (const item of filtered) { let key = ""; let label = ""; if (report === "Funcionário") { key = item.funcionarioId; label = maps.employees.get(key) ?? "Cadastro removido" } else if (report === "OP") { key = item.opId; label = `OP ${maps.orders.get(key)?.numero ?? "—"}` } else if (report === "Operação") { key = item.operacaoId; label = maps.operations.get(key) ?? "Cadastro removido" } else if (report === "Fornecedor") { const order = maps.orders.get(item.opId); key = order?.fornecedorId ?? ""; label = maps.suppliers.get(key) ?? "Cadastro removido" } else { key = item.createdAt.slice(0, 10); label = new Date(`${key}T12:00:00`).toLocaleDateString("pt-BR") } const current = grouped.get(key) ?? { label, quantity: 0, minutes: 0, expected: 0 }; current.quantity += item.quantidade; current.minutes += item.tempoMinutos; current.expected += item.producaoEsperada; grouped.set(key, current) } return Array.from(grouped.values()).map((item) => ({ ...item, efficiency: item.expected > 0 ? item.quantity / item.expected * 100 : 0 })).sort((a, b) => b.quantity - a.quantity) }, [filtered, maps, report])
  const total = rows.reduce((sum, item) => sum + item.quantity, 0)
  return <div className="page-stack"><PageHeader eyebrow="Indicadores reais" title="Relatórios" description="Agrupamentos calculados com os apontamentos persistidos." actions={<div className="segmented">{(["Hoje", "7 dias", "30 dias", "Personalizado"] as Period[]).map((item) => <button className={period === item ? "active" : ""} onClick={() => setPeriod(item)} key={item}>{item}</button>)}</div>} /><Card className="filter-bar report-filters"><Select label="Agrupar por" value={report} onChange={(e) => setReport(e.target.value as Report)}>{(["Funcionário", "OP", "Operação", "Fornecedor", "Produção diária"] as Report[]).map((item) => <option key={item}>{item}</option>)}</Select>{period === "Personalizado" ? <><Input type="date" label="Data inicial" value={from} onChange={(e) => setFrom(e.target.value)} /><Input type="date" label="Data final" value={to} onChange={(e) => setTo(e.target.value)} /></> : <div className="report-total"><span>Produção no período</span><strong>{total.toLocaleString("pt-BR")}</strong></div>}</Card>{rows.length === 0 ? <Card><EmptyState title="Sem dados no período" description="Registre apontamentos ou altere o filtro selecionado." /></Card> : <Card><Table><thead><tr><th>{report}</th><th>Quantidade produzida</th><th>Tempo trabalhado</th><th>Produção esperada</th><th>Eficiência</th></tr></thead><tbody>{rows.map((row) => <tr key={row.label}><td><strong>{row.label}</strong></td><td>{row.quantity.toLocaleString("pt-BR")}</td><td>{row.minutes} min</td><td>{row.expected.toFixed(2)}</td><td><strong>{formatPercent(row.efficiency)}</strong></td></tr>)}</tbody></Table></Card>}</div>
}
export default RelatoriosPage
