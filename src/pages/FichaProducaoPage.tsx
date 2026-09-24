import { useEffect, useMemo, useState } from "react"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { EmptyState } from "../components/ui/EmptyState"
import { Feedback } from "../components/ui/Feedback"
import { Input, Select } from "../components/ui/FormField"
import { PageHeader } from "../components/ui/PageHeader"
import { Table } from "../components/ui/Table"
import { coresRepository } from "../repositories/coresRepository"
import { fichasRepository } from "../repositories/fichasRepository"
import { funcionariosRepository } from "../repositories/funcionariosRepository"
import { operacoesRepository } from "../repositories/operacoesRepository"
import { ordensProducaoRepository } from "../repositories/ordensProducaoRepository"
import { turnosRepository } from "../repositories/turnosRepository"
import type { Cor, FichaLinha, FichaProducao, Funcionario, OperacaoCadastro, OrdemProducao, Turno } from "../types/entities"
import { formatDate, todayInputValue } from "../utils/formatters"

type SheetForm = Omit<FichaProducao, "id" | "createdAt" | "updatedAt">
const blankLine = (): FichaLinha => ({ id: crypto.randomUUID(), tamanho: "", pacote: "", operacaoId: "", horaInicial: "", horaFinal: "" })
const emptySheet = (numero = ""): SheetForm => ({ numero, funcionarioId: "", data: todayInputValue(), turnoId: "", opId: "", observacoes: "", status: "Aberta", linhas: Array.from({ length: 12 }, blankLine) })

function FichaProducaoPage() {
  const [sheets, setSheets] = useState<FichaProducao[]>([])
  const [employees, setEmployees] = useState<Funcionario[]>([])
  const [shifts, setShifts] = useState<Turno[]>([])
  const [orders, setOrders] = useState<OrdemProducao[]>([])
  const [operations, setOperations] = useState<OperacaoCadastro[]>([])
  const [colors, setColors] = useState<Cor[]>([])
  const [editingId, setEditingId] = useState<string>()
  const [form, setForm] = useState<SheetForm>(() => emptySheet())
  const [feedback, setFeedback] = useState({ message: "", tone: "success" as "success" | "error" })

  async function load() {
    const [sheetItems, employeeItems, shiftItems, orderItems, operationItems, colorItems] = await Promise.all([
      fichasRepository.getAll(), funcionariosRepository.getAll(), turnosRepository.getAll(),
      ordensProducaoRepository.getAll(), operacoesRepository.getAll(), coresRepository.getAll(),
    ])
    setSheets(sheetItems); setEmployees(employeeItems); setShifts(shiftItems)
    setOrders(orderItems); setOperations(operationItems); setColors(colorItems)
  }

  useEffect(() => {
    let active = true
    void Promise.all([
      fichasRepository.getAll(), funcionariosRepository.getAll(), turnosRepository.getAll(),
      ordensProducaoRepository.getAll(), operacoesRepository.getAll(), coresRepository.getAll(),
      fichasRepository.nextNumber(),
    ]).then(([sheetItems, employeeItems, shiftItems, orderItems, operationItems, colorItems, numero]) => {
      if (!active) return
      setSheets(sheetItems); setEmployees(employeeItems); setShifts(shiftItems)
      setOrders(orderItems); setOperations(operationItems); setColors(colorItems)
      setForm(emptySheet(numero))
    })
    return () => { active = false }
  }, [])

  const employeeMap = useMemo(() => new Map(employees.map((item) => [item.id, item.nome])), [employees])
  const shiftMap = useMemo(() => new Map(shifts.map((item) => [item.id, item.nome])), [shifts])
  const orderMap = useMemo(() => new Map(orders.map((item) => [item.id, item])), [orders])
  const colorMap = useMemo(() => new Map(colors.map((item) => [item.id, item.nome])), [colors])
  const selectedOrder = orderMap.get(form.opId)
  const selectedColor = selectedOrder ? colorMap.get(selectedOrder.corId) ?? "" : ""

  async function reset() {
    setEditingId(undefined)
    setForm(emptySheet(await fichasRepository.nextNumber()))
  }

  function updateLine(index: number, key: keyof FichaLinha, value: string) {
    setForm((current) => ({
      ...current,
      linhas: current.linhas.map((line, lineIndex) => lineIndex === index
        ? { ...line, [key]: key === "quantidade" ? (value ? Number(value) : undefined) : value }
        : line),
    }))
  }

  async function save() {
    if (!form.funcionarioId || !form.data || !form.turnoId || !form.opId) {
      setFeedback({ message: "Funcionária, data, turno e OP são obrigatórios.", tone: "error" }); return
    }
    if (editingId) await fichasRepository.update(editingId, form)
    else setEditingId((await fichasRepository.create(form)).id)
    await load()
    setFeedback({ message: `Ficha ${editingId ? "atualizada" : "salva"} com sucesso.`, tone: "success" })
  }

  function edit(sheet: FichaProducao) {
    const { id, createdAt: _createdAt, updatedAt: _updatedAt, ...data } = sheet
    void _createdAt; void _updatedAt; setEditingId(id); setForm(data)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function duplicate(sheet: FichaProducao) {
    const copy = await fichasRepository.duplicate(sheet.id)
    await load(); edit(copy)
    setFeedback({ message: `Ficha duplicada como ${copy.numero}.`, tone: "success" })
  }

  async function remove(sheet: FichaProducao) {
    if (!window.confirm(`Excluir a ficha ${sheet.numero}?`)) return
    await fichasRepository.remove(sheet.id); await load()
    if (editingId === sheet.id) await reset()
    setFeedback({ message: "Ficha excluída.", tone: "success" })
  }

  return (
    <div className="page-stack ficha-page">
      <div className="no-print page-stack">
        <PageHeader eyebrow="Chão de fábrica" title="Ficha de Apontamento de Produção" description="Fichas persistidas e relacionadas aos cadastros centrais." actions={<><Button variant="ghost" onClick={() => void reset()}>Nova ficha</Button><Button onClick={() => window.print()}>Imprimir ficha</Button></>} />
        <Feedback {...feedback} />
        <Card className="ficha-controls">
          <div className="form-grid">
            <Select label="Funcionária" value={form.funcionarioId} onChange={(event) => setForm({ ...form, funcionarioId: event.target.value })}><option value="">Selecione</option>{employees.filter((item) => item.status === "Ativo").map((item) => <option value={item.id} key={item.id}>{item.matricula} — {item.nome}</option>)}</Select>
            <Input type="date" label="Data" value={form.data} onChange={(event) => setForm({ ...form, data: event.target.value })} />
            <Select label="Turno" value={form.turnoId} onChange={(event) => setForm({ ...form, turnoId: event.target.value })}><option value="">Selecione</option>{shifts.filter((item) => item.status === "Ativo").map((item) => <option value={item.id} key={item.id}>{item.nome}</option>)}</Select>
            <Select label="OP" value={form.opId} onChange={(event) => setForm({ ...form, opId: event.target.value })}><option value="">Selecione</option>{orders.filter((item) => item.status !== "Cancelada").map((item) => <option value={item.id} key={item.id}>OP {item.numero}</option>)}</Select>
            <Input label="Cor da OP" value={selectedColor} readOnly />
            <Input label="Número da ficha" value={form.numero} readOnly />
          </div>
          <div className="modal-actions"><Button onClick={() => void save()}>{editingId ? "Salvar alterações" : "Salvar ficha"}</Button></div>
        </Card>
      </div>

      <div className="production-sheet">
        <header><div className="sheet-brand"><strong>COSTURAS HOINATZ</strong><span>Ficha de Apontamento de Produção</span></div><div className="sheet-number">Nº {form.numero}</div></header>
        <div className="sheet-meta"><label>Funcionária<input value={employeeMap.get(form.funcionarioId) ?? ""} readOnly /></label><label>Data<input type="date" value={form.data} readOnly /></label><label>Turno<input value={shiftMap.get(form.turnoId) ?? ""} readOnly /></label></div>
        <div className="sheet-reference"><strong>OP: {selectedOrder?.numero ?? ""}</strong><strong>COR: {selectedColor}</strong></div>
        <table><thead><tr><th>TAM</th><th>PACOTE</th><th>OPERAÇÃO</th><th>H.I</th><th>H.F</th><th>QTD</th></tr></thead><tbody>{form.linhas.map((line, index) => <tr key={line.id}><td><input value={line.tamanho} onChange={(event) => updateLine(index, "tamanho", event.target.value)} /></td><td><input value={line.pacote} onChange={(event) => updateLine(index, "pacote", event.target.value)} /></td><td><select value={line.operacaoId} onChange={(event) => updateLine(index, "operacaoId", event.target.value)}><option value="" />{operations.filter((item) => item.status === "Ativo").map((item) => <option value={item.id} key={item.id}>{item.codigo} {item.nome}</option>)}</select></td><td><input value={line.horaInicial} onChange={(event) => updateLine(index, "horaInicial", event.target.value)} /></td><td><input value={line.horaFinal} onChange={(event) => updateLine(index, "horaFinal", event.target.value)} /></td><td><input type="number" value={line.quantidade ?? ""} onChange={(event) => updateLine(index, "quantidade", event.target.value)} /></td></tr>)}</tbody></table>
        <label className="sheet-notes">Observações<textarea value={form.observacoes} onChange={(event) => setForm({ ...form, observacoes: event.target.value })} /></label>
        <footer><span>Preenchimento da costureira</span><span>Conferência: ____________________</span></footer>
      </div>

      <div className="no-print">
        {sheets.length === 0 ? <Card><EmptyState title="Nenhuma ficha salva" description="Preencha os dados acima e salve a primeira ficha." /></Card> : <Card><Table><thead><tr><th>Ficha</th><th>Funcionária</th><th>Data</th><th>Turno</th><th>OP</th><th>Ações</th></tr></thead><tbody>{sheets.map((sheet) => <tr key={sheet.id}><td><strong>{sheet.numero}</strong></td><td>{employeeMap.get(sheet.funcionarioId) || "Cadastro removido"}</td><td>{formatDate(sheet.data)}</td><td>{shiftMap.get(sheet.turnoId) || "—"}</td><td>OP {orderMap.get(sheet.opId)?.numero || "—"}</td><td><div className="table-actions"><button onClick={() => edit(sheet)}>Editar</button><button onClick={() => void duplicate(sheet)}>Duplicar</button><button className="danger-link" onClick={() => void remove(sheet)}>Excluir</button></div></td></tr>)}</tbody></Table></Card>}
      </div>
    </div>
  )
}

export default FichaProducaoPage
