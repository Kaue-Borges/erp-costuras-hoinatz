import { useState } from "react"
import { NavLink, Outlet, useLocation } from "react-router-dom"
import logoHoinatz from "../../assets/hoinatz-logo.png"

const navigation = [
  { to: "/", label: "Dashboard", icon: "▦" },
  { to: "/producao", label: "Produção", icon: "◉" },
  { to: "/ordens-producao", label: "Ordens de Produção", icon: "▤" },
  { to: "/etiquetas", label: "Gerar Etiquetas", icon: "▱" },
  { to: "/apontamentos", label: "Apontamentos", icon: "✓" },
  { to: "/ficha-producao", label: "Ficha da Costureira", icon: "▧" },
  { to: "/funcionarios", label: "Funcionários", icon: "♙" },
  { to: "/notas-fiscais", label: "Notas Fiscais", icon: "◇" },
  { to: "/relatorios", label: "Relatórios", icon: "⌁" },
  { to: "/cadastros", label: "Cadastros", icon: "⊞" },
  { to: "/configuracoes", label: "Configurações", icon: "⚙" },
]

const pageTitles: Record<string, string> = {
  "/": "Visão geral",
  "/producao": "Produção",
  "/ordens-producao": "Ordens de Produção",
  "/etiquetas": "Gerar Etiquetas",
  "/apontamentos": "Apontamentos de Produção",
  "/ficha-producao": "Ficha da Costureira",
  "/funcionarios": "Funcionários",
  "/notas-fiscais": "Notas Fiscais",
  "/relatorios": "Relatórios",
  "/cadastros": "Cadastros",
  "/configuracoes": "Configurações",
  "/cadastros/fornecedores": "Fornecedores",
  "/cadastros/clientes": "Clientes",
  "/cadastros/produtos": "Produtos",
  "/cadastros/operacoes": "Operações",
  "/cadastros/cores": "Cores",
  "/cadastros/maquinas": "Máquinas",
  "/cadastros/turnos": "Turnos",
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const date = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date())

  return (
    <div className="erp-shell">
      <aside className={`erp-sidebar ${sidebarOpen ? "aberta" : ""}`}>
        <div className="erp-brand">
          <img src={logoHoinatz} alt="Costuras Hoinatz" />
        </div>
        <nav aria-label="Navegação principal">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `erp-nav-item ${isActive ? "ativo" : ""}`}
            >
              <span className="erp-nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="erp-sidebar-footer">
          <span className="status-ponto" />
          Sistema local
        </div>
      </aside>

      {sidebarOpen ? (
        <button className="sidebar-overlay" aria-label="Fechar menu" onClick={() => setSidebarOpen(false)} />
      ) : null}

      <div className="erp-main">
        <header className="erp-topbar">
          <div className="topbar-title">
            <button className="menu-toggle" onClick={() => setSidebarOpen((open) => !open)} aria-label="Abrir menu">☰</button>
            <div>
              <span>Costuras Hoinatz</span>
              <h1>{pageTitles[location.pathname] ?? "ERP interno"}</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <span className="topbar-date">{date}</span>
            <button className="icon-button" aria-label="Notificações futuras">♢</button>
            <div className="user-chip">
              <span>CH</span>
              <div><strong>Administrador</strong><small>Usuário local</small></div>
            </div>
          </div>
        </header>
        <main className="erp-content"><Outlet /></main>
      </div>
    </div>
  )
}

export default AppLayout
