import { Link } from "react-router-dom"
import { Card } from "../components/ui/Card"
import { PageHeader } from "../components/ui/PageHeader"

const cadastros = [
  { nome: "Funcionários", icon: "♙", to: "/funcionarios", detail: "Equipe, funções e operações" },
  { nome: "Clientes", icon: "◎", to: "/cadastros/clientes", detail: "Dados comerciais e fiscais" },
  { nome: "Fornecedores", icon: "◇", to: "/cadastros/fornecedores", detail: "Malwee, Elian e novos parceiros" },
  { nome: "Operações", icon: "⌁", to: "/cadastros/operacoes", detail: "Tempos e metas produtivas" },
  { nome: "Cores", icon: "◐", to: "/cadastros/cores", detail: "Catálogo interno de cores" },
  { nome: "Produtos", icon: "□", to: "/cadastros/produtos", detail: "Modelos e referências" },
  { nome: "Máquinas", icon: "⚙", to: "/cadastros/maquinas", detail: "Parque fabril e capacidades" },
  { nome: "Turnos", icon: "◷", to: "/cadastros/turnos", detail: "Horários e intervalos da equipe" },
]

function CadastrosPage() {
  return <div className="page-stack"><PageHeader eyebrow="Base do ERP" title="Cadastros" description="Acessos rápidos para organizar os dados fundamentais da operação." /><div className="quick-grid">{cadastros.map((item) => <Card className="quick-card" key={item.nome}><div>{item.icon}</div><h3>{item.nome}</h3><p>{item.detail}</p><Link to={item.to}>Abrir cadastro →</Link></Card>)}</div></div>
}

export default CadastrosPage
