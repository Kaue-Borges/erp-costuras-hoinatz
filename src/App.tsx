import { lazy, Suspense } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import AppLayout from "./components/layout/AppLayout"
import "./App.css"

const DashboardPage = lazy(() => import("./pages/DashboardPage"))
const EtiquetasPage = lazy(() => import("./pages/EtiquetasPage"))
const ProducaoPage = lazy(() => import("./pages/ProducaoPage"))
const ApontamentosPage = lazy(() => import("./pages/ApontamentosPage"))
const FichaProducaoPage = lazy(() => import("./pages/FichaProducaoPage"))
const FuncionariosPage = lazy(() => import("./pages/FuncionariosPage"))
const OrdensProducaoPage = lazy(() => import("./pages/OrdensProducaoPage"))
const NotasFiscaisPage = lazy(() => import("./pages/NotasFiscaisPage"))
const RelatoriosPage = lazy(() => import("./pages/RelatoriosPage"))
const CadastrosPage = lazy(() => import("./pages/CadastrosPage"))
const ConfiguracoesPage = lazy(() => import("./pages/ConfiguracoesPage"))
const FornecedoresPage = lazy(() => import("./pages/FornecedoresPage"))
const ClientesPage = lazy(() => import("./pages/ClientesPage"))
const ProdutosPage = lazy(() => import("./pages/ProdutosPage"))
const OperacoesPage = lazy(() => import("./pages/OperacoesPage"))
const CoresPage = lazy(() => import("./pages/CoresPage"))
const MaquinasPage = lazy(() => import("./pages/MaquinasPage"))
const TurnosPage = lazy(() => import("./pages/TurnosPage"))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="route-loading">Carregando módulo…</div>}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="etiquetas" element={<EtiquetasPage />} />
            <Route path="producao" element={<ProducaoPage />} />
            <Route path="apontamentos" element={<ApontamentosPage />} />
            <Route path="ficha-producao" element={<FichaProducaoPage />} />
            <Route path="funcionarios" element={<FuncionariosPage />} />
            <Route path="ordens-producao" element={<OrdensProducaoPage />} />
            <Route path="notas-fiscais" element={<NotasFiscaisPage />} />
            <Route path="relatorios" element={<RelatoriosPage />} />
            <Route path="cadastros" element={<CadastrosPage />} />
            <Route path="configuracoes" element={<ConfiguracoesPage />} />
            <Route path="cadastros/fornecedores" element={<FornecedoresPage />} />
            <Route path="cadastros/clientes" element={<ClientesPage />} />
            <Route path="cadastros/produtos" element={<ProdutosPage />} />
            <Route path="cadastros/operacoes" element={<OperacoesPage />} />
            <Route path="cadastros/cores" element={<CoresPage />} />
            <Route path="cadastros/maquinas" element={<MaquinasPage />} />
            <Route path="cadastros/turnos" element={<TurnosPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
