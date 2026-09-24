export type CadastroStatus = "Ativo" | "Inativo"
export type FuncionarioStatus = CadastroStatus | "Afastado" | "Férias"
export type MaquinaStatus = "Disponível" | "Em uso" | "Manutenção" | "Inativa"
export type OrdemStatus = "Pendente" | "Em Produção" | "Pausada" | "Finalizada" | "Cancelada"
export type FichaStatus = "Aberta" | "Finalizada"
export type NfeStatus = "Rascunho" | "Aguardando Emissão" | "Autorizada" | "Cancelada" | "Erro"

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface Fornecedor extends BaseEntity {
  codigo: string; razaoSocial: string; nomeFantasia: string; cnpj: string; inscricaoEstadual: string
  telefone: string; whatsapp: string; email: string; contato: string; cep: string; logradouro: string
  numero: string; complemento: string; bairro: string; cidade: string; estado: string
  observacoes: string; status: CadastroStatus
}

export interface Cliente extends BaseEntity {
  tipoPessoa: "Física" | "Jurídica"; razaoSocial: string; nomeFantasia: string; cpfCnpj: string
  inscricaoEstadual: string; email: string; telefone: string; whatsapp: string; cep: string
  logradouro: string; numero: string; complemento: string; bairro: string; cidade: string
  estado: string; observacoes: string; status: CadastroStatus
}

export interface Cor extends BaseEntity { codigo: string; nome: string; hex: string; status: CadastroStatus }
export interface Turno extends BaseEntity { nome: string; horaInicio: string; horaFim: string; intervaloMinutos: number; status: CadastroStatus }

export interface Maquina extends BaseEntity {
  codigo: string; nome: string; tipo: string; marca: string; modelo: string
  numeroPatrimonio: string; status: MaquinaStatus; observacoes: string
}

export interface OperacaoCadastro extends BaseEntity {
  codigo: string; nome: string; grupo: "OVE" | "COB3 / RET" | "CAS / BOT" | "Outro"
  maquinaId: string; descricao: string; status: CadastroStatus
}

export interface Produto extends BaseEntity {
  codigo: string; descricao: string; clienteId: string; fornecedorId: string; unidade: string
  ncm: string; valorUnitario: number; status: CadastroStatus; observacoes: string
}

export interface Funcionario extends BaseEntity {
  matricula: string; nome: string; cpf: string; dataNascimento: string; telefone: string
  cargo: string; funcao: string; turnoId: string; dataAdmissao: string; status: FuncionarioStatus
  observacoes: string; operacoesHabilitadas: string[]; maquinasHabilitadas: string[]
}

export interface OrdemProducao extends BaseEntity {
  numero: string; fornecedorId: string; clienteId: string; produtoId: string; corId: string
  quantidade: number; dataEntrada: string; dataPrevista: string; dataInicio: string; dataFim: string
  status: OrdemStatus; observacoes: string
}

export interface Apontamento extends BaseEntity {
  funcionarioId: string; opId: string; operacaoId: string; corId: string; tamanho: string
  pacote: string; quantidade: number; horaInicio: string; horaFim: string; metaPecasHora: number
  observacao: string; tempoMinutos: number; producaoEsperada: number; eficiencia: number
}

export interface FichaLinha {
  id: string; tamanho: string; pacote: string; operacaoId: string; horaInicial: string
  horaFinal: string; quantidade?: number
}

export interface FichaProducao extends BaseEntity {
  numero: string; funcionarioId: string; data: string; turnoId: string; opId: string
  observacoes: string; status: FichaStatus; linhas: FichaLinha[]
}

export interface NfeItem {
  id: string; produtoId: string; descricao: string; ncm: string; cfop: string
  quantidade: number; valorUnitario: number; valorTotal: number
}

export interface NotaFiscal extends BaseEntity {
  numeroInterno: string; clienteId: string; naturezaOperacao: string; cfop: string
  data: string; itens: NfeItem[]; observacoes: string; status: NfeStatus
}

export interface EtiquetaHistorico extends BaseEntity {
  fornecedor: string; op: string; cor: string; dataHora: string; evento: "Gerada" | "Impressa"
}

export interface Configuracoes {
  empresa: string; cnpj: string; turnos: string; baixa: number; normal: number
  boa: number; fornecedor: string; impressora: string
}
