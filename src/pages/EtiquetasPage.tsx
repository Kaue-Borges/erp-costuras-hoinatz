import { useState } from "react"
import * as pdfjsLib from "pdfjs-dist"
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url"
import { etiquetasHistoricoRepository } from "../repositories/etiquetasHistoricoRepository"

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

type Operacao = {
  descricao: string
  tempo: number
  valor: number | null
  codigo?: string
  maquina?: string
  pcHrPdf?: number | null
}

type GrupoEtiqueta = "OVE" | "COB3 / RET" | "CAS / BOT"

type ItemEtiqueta = {
  grupo: GrupoEtiqueta
  codigo: string
  nome: string
  valor: number
  ordem: number
}

type RegraEtiqueta = {
  grupo: GrupoEtiqueta
  codigo: string
  nome: string
  regex: RegExp
  ordem: number
}

type PdfItem = {
  str: string
  hasEOL?: boolean
}

type GradeElian = {
  id: string
  nome: string
  operacoes: Operacao[]
}

type OperacaoElianBruta = {
  codigo: string
  descricao: string
  maquina?: string
  pares: Array<{
    tempo: number
    pcHr: number
  }>
}

const regrasEtiqueta: RegraEtiqueta[] = [
  // =========================
  // OVE
  // =========================
  {
    grupo: "OVE",
    codigo: "112",
    nome: "Retilinea Mangas",
    regex: /RETILINEA.*MANGAS/,
    ordem: 1,
  },
  {
    grupo: "OVE",
    codigo: "10",
    nome: "Fechar Ombros",
    regex: /FECHAR OMBROS|REMATAR OMBROS/,
    ordem: 2,
  },
  {
    grupo: "OVE",
    codigo: "11",
    nome: "Pregar Mangas",
    regex: /PREGAR MANGAS/,
    ordem: 3,
  },
  {
    grupo: "OVE",
    codigo: "13",
    nome: "Fechar Lados",
    regex: /EMBUTIR MANGAS E LADOS|FECHAR LADOS|REMATAR MANGAS.*LADOS/,
    ordem: 4,
  },
  {
    grupo: "OVE",
    codigo: "12",
    nome: "Pregar Gola",
    regex: /PREGAR RETILINEA COM TIRA NO DECOTE|PREGAR GOLA/,
    ordem: 5,
  },
  {
    grupo: "OVE",
    codigo: "14",
    nome: "Debrum Manga",
    regex: /DEBRUM.*MANGA/,
    ordem: 6,
  },
  {
    grupo: "OVE",
    codigo: "17",
    nome: "Recorte Manga",
    regex: /RECORTE.*MANGA/,
    ordem: 7,
  },
  {
    grupo: "OVE",
    codigo: "18",
    nome: "Fechar Gola",
    regex: /FECHAR GOLA/,
    ordem: 8,
  },

  // =========================
  // COB3 / RET
  // =========================
  {
    grupo: "COB3 / RET",
    codigo: "30",
    nome: "Bainha Mangas",
    regex: /BAINHAR MANGAS?|FAZER BAINHA.*MANGAS/,
    ordem: 1,
  },
  {
    grupo: "COB3 / RET",
    codigo: "31",
    nome: "Bainha Barra",
    regex: /BAINHAR BARRA|FAZER BAINHA (?:CINTURA|BARRA)/,
    ordem: 2,
  },
  {
    grupo: "COB3 / RET",
    codigo: "20",
    nome: "Pesp. Decote",
    regex: /^PESPONTAR TIRA$|PESPONTAR.*DECOTE/,
    ordem: 3,
  },
  {
    grupo: "COB3 / RET",
    codigo: "25",
    nome: "Pesp. Mangas",
    regex: /PESPONTAR.*MANGAS/,
    ordem: 4,
  },
  {
    grupo: "COB3 / RET",
    codigo: "22",
    nome: "Pesp. Gola",
    regex: /PESPONTAR.*GOLA/,
    ordem: 5,
  },
  {
    grupo: "COB3 / RET",
    codigo: "28",
    nome: "Travetar Bainha",
    regex: /FAZER\s+TRAVETE\s+SOBRE\s+COSTURA\s+DE\s+COBERTURA|TRAVET.*BAINHA/i,
    ordem: 6,
  },

  // =========================
  // CAS / BOT
  // =========================
  {
    grupo: "CAS / BOT",
    codigo: "40",
    nome: "Pregar Peitilho",
    regex: /PREGAR PEITILHO/,
    ordem: 1,
  },
  {
    grupo: "CAS / BOT",
    codigo: "41",
    nome: "Travetar Peitilho",
    regex: /TRAVET.*PEITILHO/,
    ordem: 2,
  },
  {
    grupo: "CAS / BOT",
    codigo: "50",
    nome: "Caseado",
    regex: /CASEAR|CASEADO/,
    ordem: 3,
  },
  {
    grupo: "CAS / BOT",
    codigo: "51",
    nome: "Botão",
    regex: /PREGAR BOTAO/,
    ordem: 4,
  },
]

const maquinasElian = new Set([
  "MAN",
  "OVE",
  "OVR",
  "RET",
  "TAPE",
  "COB",
  "COB2",
  "COB3",
  "COB4",
  "COB5",
  "GAL",
  "CAS",
  "BOT",
  "TRAV",
  "RETA",
  "OVER",
])

function calcularPcHora(tempo: number) {
  if (!Number.isFinite(tempo) || tempo <= 0) {
    return null
  }

  // Regra única para todos os fornecedores:
  // produtividade = 60 dividido pelo tempo da operação.
  return Math.floor(60 / tempo)
}

function normalizarTexto(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim()
}

function encontrarPrefixoComum(textos: string[]) {
  if (textos.length === 0) {
    return ""
  }

  let prefixo = textos[0]

  for (let i = 1; i < textos.length; i++) {
    while (!textos[i].startsWith(prefixo)) {
      prefixo = prefixo.slice(0, -1)

      if (prefixo === "") {
        return ""
      }
    }
  }

  const ultimoEspaco = prefixo.lastIndexOf(" ")

  if (ultimoEspaco !== -1) {
    return prefixo.slice(0, ultimoEspaco + 1)
  }

  return prefixo
}

function montarLinhasPdf(itens: PdfItem[]) {
  const linhas: string[][] = []
  let linhaAtual: string[] = []

  itens.forEach((item) => {
    const texto = item.str.trim()

    if (texto) {
      linhaAtual.push(texto)
    }

    if (item.hasEOL) {
      if (linhaAtual.length > 0) {
        linhas.push(linhaAtual)
      }

      linhaAtual = []
    }
  })

  if (linhaAtual.length > 0) {
    linhas.push(linhaAtual)
  }

  return linhas
}

function extrairNomesGradesElian(itens: PdfItem[]) {
  const linhas = montarLinhasPdf(itens)

  const linhaGrade = linhas.find((linha) =>
    linha.some((parte) => normalizarTexto(parte) === "GRADE"),
  )

  if (!linhaGrade) {
    return []
  }

  return linhaGrade
    .filter((parte) => /^\d+\s*-\s*.+/.test(parte.trim()))
    .map((parte) => parte.replace(/\s+/g, " ").trim())
}

function extrairOperacoesElian(itens: PdfItem[]) {
  const tokens = itens
    .map((item) => item.str.trim())
    .filter(Boolean)

  const operacoes: OperacaoElianBruta[] = []

  for (let i = 0; i < tokens.length; i++) {
    if (!/^\d{5}$/.test(tokens[i])) {
      continue
    }

    const codigo = tokens[i]
    let fim = tokens.length

    for (let j = i + 1; j < tokens.length; j++) {
      if (/^\d{5}$/.test(tokens[j]) || normalizarTexto(tokens[j]) === "TOTAL DA GRADE:") {
        fim = j
        break
      }
    }

    const bloco = tokens.slice(i, fim)

    if (bloco.length < 2) {
      continue
    }

    let indiceMaquina = -1

    for (let j = 2; j < bloco.length; j++) {
      const candidato = normalizarTexto(bloco[j])

      if (maquinasElian.has(candidato) || /^COB\d+$/.test(candidato)) {
        indiceMaquina = j
        break
      }
    }

    const descricao = (indiceMaquina > 1 ? bloco.slice(1, indiceMaquina) : [bloco[1]])
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()

    const maquina = indiceMaquina >= 0 ? normalizarTexto(bloco[indiceMaquina]) : undefined
    const pares: OperacaoElianBruta["pares"] = []

    for (let j = Math.max(indiceMaquina + 1, 2); j < bloco.length; j++) {
      if (!/^\d+,\d{3}$/.test(bloco[j])) {
        continue
      }

      const tempo = Number(bloco[j].replace(",", "."))
      let pcHr: number | null = null

      for (let k = j + 1; k < bloco.length; k++) {
        if (/^\d+,\d{3}$/.test(bloco[k])) {
          break
        }

        if (/^\d+$/.test(bloco[k])) {
          pcHr = Number(bloco[k])
          break
        }
      }

      if (Number.isFinite(tempo) && pcHr !== null) {
        pares.push({ tempo, pcHr })
      }
    }

    if (descricao && pares.length > 0) {
      operacoes.push({
        codigo,
        descricao,
        maquina,
        pares,
      })
    }

    i = fim - 1
  }

  return operacoes
}

function EtiquetasPage() {
  const [fornecedor, setFornecedor] = useState("")
  const [op, setOp] = useState("")
  const [cor, setCor] = useState("")
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [operacoes, setOperacoes] = useState<Operacao[]>([])
  const [etiquetaGerada, setEtiquetaGerada] = useState(false)
  const [gradesElian, setGradesElian] = useState<GradeElian[]>([])
  const [gradeElianSelecionada, setGradeElianSelecionada] = useState("")
  const [editandoEtiqueta, setEditandoEtiqueta] = useState(false)
  const [valoresManuais, setValoresManuais] = useState<Record<string, string>>({})

  function limparLeitura() {
    setOperacoes([])
    setEtiquetaGerada(false)
    setGradesElian([])
    setGradeElianSelecionada("")
    setEditandoEtiqueta(false)
    setValoresManuais({})
  }

  async function lerPdf() {
    if (!fornecedor) {
      alert("Selecione o fornecedor")
      return
    }

    if (!op && fornecedor !== "malwee") {
      alert("Digite a OP")
      return
    }

    if (!cor) {
      alert("Digite a cor")
      return
    }

    if (!arquivo) {
      alert("Selecione um PDF")
      return
    }

    try {
      limparLeitura()

      const arrayBuffer = await arquivo.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      let textoCompleto = ""
      const itensPdf: PdfItem[] = []

      for (let numeroPagina = 1; numeroPagina <= pdf.numPages; numeroPagina++) {
        const pagina = await pdf.getPage(numeroPagina)
        const conteudo = await pagina.getTextContent()

        conteudo.items.forEach((item) => {
          if (!("str" in item)) {
            return
          }

          textoCompleto += ` ${item.str}`
          itensPdf.push({
            str: item.str,
            hasEOL: "hasEOL" in item ? Boolean(item.hasEOL) : false,
          })
        })

        itensPdf.push({ str: "", hasEOL: true })
      }

      const texto = textoCompleto.replace(/\s+/g, " ").trim()

      if (fornecedor === "malwee") {
        processarMalwee(texto)
      } else {
        processarElian(itensPdf)
      }
    } catch (erro) {
      console.error(erro)
      alert("Erro ao ler o PDF.")
    }
  }

  function processarMalwee(texto: string) {
    setGradesElian([])
    setGradeElianSelecionada("")

    const codigoMaterial = texto.match(/\b100000\d+\b/)

    if (!codigoMaterial) {
      alert("Código do material não encontrado.")
      return
    }

    const codigoCompleto = codigoMaterial[0]
    const opMalwee = codigoCompleto.replace(/^100000/, "")

    setOp(opMalwee)

    const regexCodigo = new RegExp(`\\b${codigoCompleto}\\b`, "g")

    const blocos = texto
      .split(regexCodigo)
      .slice(1)
      .map((bloco) => bloco.trim())

    const linhasEncontradas = blocos
      .map((bloco) => {
        const resultadoTempo = bloco.match(/\b\d+,\d{3}\b/)

        if (!resultadoTempo || resultadoTempo.index === undefined) {
          return null
        }

        const antesTempo = bloco.slice(0, resultadoTempo.index).trim()

        return {
          antesTempo,
          tempoTexto: resultadoTempo[0],
        }
      })
      .filter(
        (linha): linha is { antesTempo: string; tempoTexto: string } => linha !== null,
      )

    if (linhasEncontradas.length === 0) {
      alert("Nenhuma operação encontrada.")
      return
    }

    const prefixoProduto = encontrarPrefixoComum(
      linhasEncontradas.map((linha) => linha.antesTempo),
    )

    const operacoesEncontradas: Operacao[] = linhasEncontradas.map((linha) => {
      const descricao = linha.antesTempo.replace(prefixoProduto, "").trim()
      const tempo = Number(linha.tempoTexto.replace(",", "."))
      const valor = calcularPcHora(tempo)

      return {
        descricao,
        tempo,
        valor,
      }
    })

    setOperacoes(operacoesEncontradas)
  }

  function processarElian(itensPdf: PdfItem[]) {
    const nomesGrades = extrairNomesGradesElian(itensPdf)
    const operacoesBrutas = extrairOperacoesElian(itensPdf)

    if (operacoesBrutas.length === 0) {
      alert("Nenhuma operação da Elian foi encontrada no PDF.")
      return
    }

    const maiorQuantidadePares = Math.max(
      ...operacoesBrutas.map((operacao) => operacao.pares.length),
    )

    const nomesFinais = [...nomesGrades]

    if (nomesFinais.length === 0) {
      for (let i = 0; i < maiorQuantidadePares; i++) {
        nomesFinais.push(
          maiorQuantidadePares === 1 ? "Grade única" : `Grade ${i + 1}`,
        )
      }
    }

    while (nomesFinais.length < maiorQuantidadePares) {
      nomesFinais.push(`Grade ${nomesFinais.length + 1}`)
    }

    const grades: GradeElian[] = nomesFinais.map((nome, indiceGrade) => {
      const operacoesDaGrade: Operacao[] = operacoesBrutas
        .map((operacao) => {
          const par = operacao.pares[indiceGrade]

          if (!par) {
            return null
          }

          // Elian usa a mesma regra da Malwee: 60 / tempo.
          const valor = calcularPcHora(par.tempo)

          return {
            codigo: operacao.codigo,
            descricao: operacao.descricao,
            maquina: operacao.maquina,
            tempo: par.tempo,
            pcHrPdf: par.pcHr,
            valor,
          }
        })
        .filter(
          (operacao): operacao is NonNullable<typeof operacao> => operacao !== null,
        )

      return {
        id: `elian-grade-${indiceGrade}`,
        nome,
        operacoes: operacoesDaGrade,
      }
    })

    const gradesComOperacoes = grades.filter((grade) => grade.operacoes.length > 0)

    if (gradesComOperacoes.length === 0) {
      alert("As grades foram identificadas, mas não foi possível ler os tempos.")
      return
    }

    setGradesElian(gradesComOperacoes)
    setGradeElianSelecionada(gradesComOperacoes[0].id)
    setOperacoes(gradesComOperacoes[0].operacoes)
  }

  function trocarGradeElian(idGrade: string) {
    setGradeElianSelecionada(idGrade)
    setEtiquetaGerada(false)
    setEditandoEtiqueta(false)
    setValoresManuais({})

    const grade = gradesElian.find((item) => item.id === idGrade)

    if (grade) {
      setOperacoes(grade.operacoes)
    }
  }

  function montarItensEtiqueta() {
    const itens: ItemEtiqueta[] = []

    for (const operacao of operacoes) {
      if (operacao.valor === null) {
        continue
      }

      const descricaoNormalizada = normalizarTexto(operacao.descricao)

      const regra = regrasEtiqueta.find((item) => item.regex.test(descricaoNormalizada))

      if (!regra) {
        continue
      }

      itens.push({
        grupo: regra.grupo,
        codigo: regra.codigo,
        nome: regra.nome,
        valor: operacao.valor,
        ordem: regra.ordem,
      })
    }

    const mapa = new Map<string, ItemEtiqueta>()

    itens.forEach((item) => {
      const chave = `${item.grupo}-${item.codigo}-${item.nome}`

      if (!mapa.has(chave)) {
        mapa.set(chave, item)
      }
    })

    return Array.from(mapa.values())
  }

  const itensEtiqueta = montarItensEtiqueta()

  function chaveItemEtiqueta(item: ItemEtiqueta) {
    return `${item.grupo}-${item.codigo}-${item.nome}`
  }

  function valorAtualEtiqueta(item: ItemEtiqueta) {
    const chave = chaveItemEtiqueta(item)
    const valorManual = valoresManuais[chave]

    if (valorManual === undefined || valorManual.trim() === "") {
      return item.valor
    }

    const numero = Number(valorManual)
    return Number.isFinite(numero) ? numero : item.valor
  }

  function editarValorEtiqueta(item: ItemEtiqueta, novoValor: string) {
    if (novoValor !== "" && !/^\d+$/.test(novoValor)) {
      return
    }

    setValoresManuais((valoresAtuais) => ({
      ...valoresAtuais,
      [chaveItemEtiqueta(item)]: novoValor,
    }))
  }

  function restaurarValoresCalculados() {
    setValoresManuais({})
  }

  async function gerarEtiqueta() {
    if (operacoes.length === 0) {
      alert("Leia o PDF primeiro.")
      return
    }

    if (itensEtiqueta.length === 0) {
      alert("Nenhuma operação da etiqueta foi encontrada.")
      return
    }

    await etiquetasHistoricoRepository.create({
      fornecedor: fornecedor === "malwee" ? "Malwee" : "Elian",
      op,
      cor,
      dataHora: new Date().toISOString(),
      evento: "Gerada",
    })
    setEditandoEtiqueta(false)
    setEtiquetaGerada(true)
  }

  function itensDoGrupo(grupo: GrupoEtiqueta) {
    return itensEtiqueta
      .filter((item) => item.grupo === grupo)
      .sort((a, b) => a.ordem - b.ordem)
  }

  async function imprimirEtiqueta() {
    await etiquetasHistoricoRepository.create({
      fornecedor: fornecedor === "malwee" ? "Malwee" : "Elian",
      op,
      cor,
      dataHora: new Date().toISOString(),
      evento: "Impressa",
    })
    window.print()
  }

  const gradeAtual = gradesElian.find((grade) => grade.id === gradeElianSelecionada)

  return (
    <div className="etiquetas-page">
      <main className="conteudo etiquetas-conteudo">
        <section className="painel formulario">
          <div className="painel-cabecalho">
            <div>
              <span className="secao-kicker">Nova leitura</span>
              <h2>Dados da etiqueta</h2>
            </div>

            <span className={`fornecedor-badge ${fornecedor || "vazio"}`}>
              {fornecedor === "malwee"
                ? "Malwee"
                : fornecedor === "elian"
                  ? "Elian"
                  : "Fornecedor"}
            </span>
          </div>

          <div className="grade-formulario">
            <div className="campo">
              <label htmlFor="fornecedor">Fornecedor</label>
              <select
                id="fornecedor"
                value={fornecedor}
                onChange={(e) => {
                  const novoFornecedor = e.target.value
                  setFornecedor(novoFornecedor)
                  setOp("")
                  limparLeitura()
                }}
              >
                <option value="">Selecione</option>
                <option value="malwee">Malwee</option>
                <option value="elian">Elian</option>
              </select>
            </div>

            <div className="campo">
              <label htmlFor="op">OP</label>
              <input
                id="op"
                type="text"
                value={op}
                onChange={(e) => setOp(e.target.value)}
                placeholder={fornecedor === "malwee" ? "Automática após ler o PDF" : "Digite a OP"}
              />
              <small>
                {fornecedor === "malwee"
                  ? "A Malwee preenche a OP automaticamente pelo PDF."
                  : fornecedor === "elian"
                    ? "Na Elian, a OP é informada manualmente."
                    : "Informe o fornecedor para continuar."}
              </small>
            </div>

            <div className="campo">
              <label htmlFor="cor">Cor</label>
              <input
                id="cor"
                type="text"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                placeholder="Ex: NATURAL"
              />
            </div>

            {fornecedor === "elian" && gradesElian.length > 0 && (
              <div className="campo">
                <label htmlFor="grade-elian">Grade Elian</label>
                <select
                  id="grade-elian"
                  value={gradeElianSelecionada}
                  onChange={(e) => trocarGradeElian(e.target.value)}
                >
                  {gradesElian.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.nome}
                    </option>
                  ))}
                </select>
                <small>O PDF trouxe mais de uma grade. Escolha qual etiqueta será usada.</small>
              </div>
            )}
          </div>

          <div className="campo campo-arquivo">
            <label htmlFor="arquivo-pdf">Arquivo PDF</label>
            <input
              id="arquivo-pdf"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => {
                const arquivoSelecionado = e.target.files?.[0]

                if (arquivoSelecionado) {
                  setArquivo(arquivoSelecionado)
                  limparLeitura()
                }
              }}
            />

            {arquivo && (
              <div className="arquivo-selecionado">
                <span className="arquivo-icone">PDF</span>
                <div>
                  <strong>{arquivo.name}</strong>
                  <small>Pronto para leitura</small>
                </div>
              </div>
            )}
          </div>

          <div className="botoes">
            <button className="botao-primario" onClick={lerPdf}>
              Ler PDF
            </button>

            {operacoes.length > 0 && (
              <button className="botao-secundario" onClick={gerarEtiqueta}>
                Gerar etiqueta
              </button>
            )}
          </div>
        </section>

        {operacoes.length > 0 && (
          <section className="painel calculos">
            <div className="painel-cabecalho calculos-cabecalho">
              <div>
                <span className="secao-kicker">Leitura concluída</span>
                <h2>Operações calculadas</h2>
              </div>

              <div className="resumo-leitura">
                {fornecedor === "elian" && gradeAtual && (
                  <span className="resumo-chip">{gradeAtual.nome}</span>
                )}
                <span className="resumo-chip">{operacoes.length} operações</span>
                <span className="resumo-chip destaque">{itensEtiqueta.length} na etiqueta</span>
              </div>
            </div>

            <div className="tabela-wrap">
              <table>
                <thead>
                  <tr>
                    {fornecedor === "elian" && <th>Cód.</th>}
                    <th>Operação</th>
                    {fornecedor === "elian" && <th>Máq.</th>}
                    <th>Tempo</th>
                    <th>PC/H</th>
                  </tr>
                </thead>

                <tbody>
                  {operacoes.map((operacao, index) => (
                    <tr key={`${operacao.codigo ?? "op"}-${index}`}>
                      {fornecedor === "elian" && <td>{operacao.codigo ?? "-"}</td>}
                      <td>{operacao.descricao}</td>
                      {fornecedor === "elian" && <td>{operacao.maquina ?? "-"}</td>}
                      <td>{operacao.tempo.toFixed(3).replace(".", ",")}</td>
                      <td>{operacao.valor ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {etiquetaGerada && (
          <section className="painel painel-etiqueta">
            <div className="painel-cabecalho">
              <div>
                <span className="secao-kicker">Pré-visualização</span>
                <h2>Etiqueta pronta</h2>
              </div>
            </div>

            <div className="area-etiqueta">
              <div className="etiqueta">
                <div className="titulo-etiqueta">A / /</div>

                <div className="linha-cabecalho">{op}</div>

                <div className="linha-cabecalho cor">{cor.toUpperCase()}</div>

                {(["OVE", "COB3 / RET", "CAS / BOT"] as GrupoEtiqueta[]).map((grupo) => {
                  const itens = itensDoGrupo(grupo)

                  if (itens.length === 0) {
                    return null
                  }

                  return (
                    <div key={grupo}>
                      <div className="grupo-etiqueta">{grupo}</div>

                      {itens.map((item, index) => {
                        const chave = chaveItemEtiqueta(item)
                        const valorCalculado = item.valor
                        const valorAtual = valorAtualEtiqueta(item)
                        const foiEditado =
                          valoresManuais[chave] !== undefined &&
                          valoresManuais[chave] !== "" &&
                          valorAtual !== valorCalculado

                        return (
                          <div
                            className={`item-etiqueta ${foiEditado ? "item-editado" : ""}`}
                            key={`${grupo}-${index}`}
                          >
                            <span>
                              ({item.codigo}) {item.nome}
                            </span>

                            {editandoEtiqueta ? (
                              <input
                                className="valor-etiqueta-input"
                                type="text"
                                inputMode="numeric"
                                value={valoresManuais[chave] ?? String(valorCalculado)}
                                onChange={(e) => editarValorEtiqueta(item, e.target.value)}
                                aria-label={`Valor de ${item.nome}`}
                              />
                            ) : (
                              <strong title={foiEditado ? `Calculado: ${valorCalculado}` : undefined}>
                                {valorAtual}
                              </strong>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>

              <div className="acoes-etiqueta">
                {editandoEtiqueta ? (
                  <>
                    <button
                      className="botao-editar-etiqueta botao-salvar-edicao"
                      onClick={() => setEditandoEtiqueta(false)}
                    >
                      Salvar valores
                    </button>

                    <button
                      className="botao-editar-etiqueta botao-restaurar-valores"
                      onClick={restaurarValoresCalculados}
                    >
                      Restaurar cálculo
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="botao-editar-etiqueta"
                      onClick={() => setEditandoEtiqueta(true)}
                    >
                      Editar valores
                    </button>

                    <button className="botao-imprimir" onClick={imprimirEtiqueta}>
                      Imprimir etiqueta
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default EtiquetasPage
