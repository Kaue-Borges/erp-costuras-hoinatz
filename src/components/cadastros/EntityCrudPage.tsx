import { useEffect, useMemo, useState, type FormEvent } from "react"
import type { CreateInput, Repository } from "../../repositories/createRepository"
import type { BaseEntity } from "../../types/entities"
import { Button } from "../ui/Button"
import { Card } from "../ui/Card"
import { EmptyState } from "../ui/EmptyState"
import { Feedback } from "../ui/Feedback"
import { Input, Select } from "../ui/FormField"
import { Modal } from "../ui/Modal"
import { PageHeader } from "../ui/PageHeader"
import { Table } from "../ui/Table"

export type FieldOption = { value: string; label: string }
export type EntityField<T extends BaseEntity> = {
  key: keyof CreateInput<T> & string; label: string
  type?: "text" | "number" | "date" | "time" | "email" | "color" | "textarea" | "select" | "multiselect"
  required?: boolean; options?: FieldOption[]; placeholder?: string; full?: boolean
}
export type EntityColumn<T extends BaseEntity> = { label: string; render: (item: T) => React.ReactNode }

type Props<T extends BaseEntity> = {
  title: string; eyebrow: string; description: string; singular: string; repository: Repository<T>
  emptyValue: () => CreateInput<T>; fields: EntityField<T>[]; columns: EntityColumn<T>[]
  searchText: (item: T) => string; statusOptions?: string[]
  activeStatus?: string; inactiveStatus?: string
  validate?: (value: CreateInput<T>, items: T[], editingId?: string) => string | undefined
  canRemove?: (item: T) => Promise<string | undefined>
}

function valueText(value: unknown, field: EntityField<BaseEntity>) {
  if (Array.isArray(value)) return value.map((entry) => field.options?.find((option) => option.value === entry)?.label ?? entry).join(", ") || "—"
  return field.options?.find((option) => option.value === String(value))?.label ?? String(value || "—")
}

export function EntityCrudPage<T extends BaseEntity>({ title, eyebrow, description, singular, repository, emptyValue, fields, columns, searchText, statusOptions = ["Ativo", "Inativo"], activeStatus = "Ativo", inactiveStatus = "Inativo", validate, canRemove }: Props<T>) {
  const [items, setItems] = useState<T[]>([])
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [form, setForm] = useState<CreateInput<T>>(emptyValue)
  const [editingId, setEditingId] = useState<string>()
  const [viewing, setViewing] = useState<T>()
  const [modalOpen, setModalOpen] = useState(false)
  const [feedback, setFeedback] = useState({ message: "", tone: "success" as "success" | "error" })

  async function reload() { setItems(await repository.getAll()) }
  useEffect(() => {
    let active = true
    void repository.getAll().then((data) => { if (active) setItems(data) })
    return () => { active = false }
  }, [repository])

  const filtered = useMemo(() => items.filter((item) => {
    const matchesQuery = !query || searchText(item).toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))
    const itemStatus = "status" in item ? String(item.status) : ""
    return matchesQuery && (!statusFilter || itemStatus === statusFilter)
  }), [items, query, searchText, statusFilter])

  function openNew() { setEditingId(undefined); setForm(emptyValue()); setModalOpen(true) }
  function openEdit(item: T) {
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...data } = item
    void _id; void _createdAt; void _updatedAt
    setEditingId(item.id); setForm(data as CreateInput<T>); setModalOpen(true)
  }

  function updateField(key: keyof CreateInput<T> & string, value: unknown) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    const error = validate?.(form, items, editingId)
    if (error) { setFeedback({ message: error, tone: "error" }); window.alert(error); return }
    if (editingId) await repository.update(editingId, form)
    else await repository.create(form)
    await reload(); setModalOpen(false)
    setFeedback({ message: `${singular} ${editingId ? "atualizado" : "cadastrado"} com sucesso.`, tone: "success" })
  }

  async function toggle(item: T) {
    const onStatus = statusOptions.includes("Disponível") ? "Disponível" : activeStatus
    const offStatus = statusOptions.includes("Inativa") ? "Inativa" : inactiveStatus
    await repository.toggleStatus(item.id, onStatus, offStatus)
    await reload(); setFeedback({ message: `Status de ${singular.toLowerCase()} atualizado.`, tone: "success" })
  }

  async function remove(item: T) {
    const reason = await canRemove?.(item)
    if (reason) { setFeedback({ message: reason, tone: "error" }); return }
    if (!window.confirm(`Excluir ${singular.toLowerCase()} permanentemente?`)) return
    await repository.remove(item.id); await reload()
    setFeedback({ message: `${singular} excluído.`, tone: "success" })
  }

  return <div className="page-stack"><PageHeader eyebrow={eyebrow} title={title} description={description} actions={<Button onClick={openNew}>+ Novo</Button>} /><Feedback {...feedback} /><Card className="filter-bar"><Input label="Pesquisar" placeholder={`Buscar ${singular.toLowerCase()}...`} value={query} onChange={(event) => setQuery(event.target.value)} /><Select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">Todos</option>{statusOptions.map((status) => <option key={status}>{status}</option>)}</Select></Card>{filtered.length === 0 ? <Card><EmptyState title={`Nenhum ${singular.toLowerCase()} encontrado`} description="Cadastre um registro ou ajuste os filtros." /></Card> : <Card><Table><thead><tr>{columns.map((column) => <th key={column.label}>{column.label}</th>)}<th>Ações</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}>{columns.map((column) => <td key={column.label}>{column.render(item)}</td>)}<td><div className="table-actions"><button onClick={() => setViewing(item)}>Visualizar</button><button onClick={() => openEdit(item)}>Editar</button>{"status" in item ? <button onClick={() => void toggle(item)}>Inativar/Ativar</button> : null}<button className="danger-link" onClick={() => void remove(item)}>Excluir</button></div></td></tr>)}</tbody></Table></Card>}{modalOpen ? <Modal title={`${editingId ? "Editar" : "Novo"} ${singular.toLowerCase()}`} onClose={() => setModalOpen(false)}><form className="modal-form" onSubmit={(event) => void save(event)}><div className="form-grid">{fields.map((field) => { const raw = form[field.key]; const common = { label: field.label, required: field.required, value: typeof raw === "number" ? raw : String(raw ?? ""), placeholder: field.placeholder, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => updateField(field.key, field.type === "number" ? Number(event.target.value) : event.target.value) }; if (field.type === "textarea") return <label className={`ui-field ${field.full ? "full-field" : ""}`} key={field.key}><span>{field.label}</span><textarea required={field.required} value={String(raw ?? "")} onChange={(event) => updateField(field.key, event.target.value)} /></label>; if (field.type === "select") return <Select {...common} key={field.key}>{field.options?.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</Select>; if (field.type === "multiselect") return <label className={`ui-field ${field.full ? "full-field" : ""}`} key={field.key}><span>{field.label}</span><select multiple value={Array.isArray(raw) ? raw.map(String) : []} onChange={(event) => updateField(field.key, Array.from(event.target.selectedOptions, (option) => option.value))}>{field.options?.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select><small>Use Ctrl para selecionar mais de uma opção.</small></label>; return <Input {...common} type={field.type ?? "text"} key={field.key} /> })}</div><div className="modal-actions"><Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button><Button type="submit">Salvar</Button></div></form></Modal> : null}{viewing ? <Modal title={`Detalhes — ${singular}`} onClose={() => setViewing(undefined)}><dl className="detail-grid">{fields.map((field) => <div key={field.key}><dt>{field.label}</dt><dd>{valueText(viewing[field.key as keyof T], field as EntityField<BaseEntity>)}</dd></div>)}</dl><div className="modal-actions"><Button variant="ghost" onClick={() => setViewing(undefined)}>Fechar</Button><Button onClick={() => { openEdit(viewing); setViewing(undefined) }}>Editar</Button></div></Modal> : null}</div>
}

