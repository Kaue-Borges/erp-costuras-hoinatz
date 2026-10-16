# ERP Costuras Hoinatz

Sistema web para apoiar a gestão da produção em confecção, com **cadastros, ordens de produção, apontamentos, indicadores e geração de etiquetas a partir de PDFs**.

Construído com **React, TypeScript, Vite, React Router e PDF.js**.

> **Estado do projeto:** aplicação frontend em desenvolvimento. Os dados desta versão são armazenados no **localStorage do navegador**; não há servidor de dados compartilhado implementado no código consultado. A integração fiscal real também não está configurada.

## Funcionalidades disponíveis na interface

| Área | O que está implementado no frontend |
| --- | --- |
| **Dashboard** | Visão geral da produção e indicadores calculados com os registros locais |
| **Etiquetas** | Leitura de PDFs e geração de etiquetas com regras por fornecedor |
| **Ordens de produção** | Cadastro e acompanhamento de OPs vinculadas aos demais cadastros |
| **Apontamentos** | Registros de produção, horários, operações e cálculos de eficiência |
| **Ficha de produção** | Página específica para os dados de fichas |
| **Cadastros** | Funcionários, fornecedores, clientes, produtos, operações, cores, máquinas e turnos |
| **Gestão** | Telas de notas fiscais, relatórios e configurações |

A existência de uma página não implica integração com serviços externos ou persistência em banco de dados: a versão atual usa repositórios locais no navegador.

## Leitura de PDFs e etiquetas

A tela de etiquetas usa `pdfjs-dist` para ler documentos em PDF. Há regras específicas de interpretação para os fornecedores:

- **Malwee:** identificação de código/OP e operações nos documentos usados pelo sistema.
- **Elian:** leitura de dados operacionais e suporte a seleção de grade quando o documento apresenta múltiplas grades.
- **Cálculo de peças por hora:** regras específicas de produção, incluindo o cálculo `Math.floor(60 / tempo)` em fluxos de etiquetas.

Os formatos de PDF podem variar. Valide as operações extraídas antes de utilizar as etiquetas na produção.

## Como executar localmente

Requisitos: **Node.js** e **npm** instalados.

```bash
git clone https://github.com/Kaue-Borges/erp-costuras-hoinatz.git
cd erp-costuras-hoinatz
npm install
npm run dev
```

Abra a URL indicada pelo Vite no terminal.

Para compilar ou conferir o código:

```bash
npm run build
npm run lint
```

Os comandos acima são os scripts definidos em `package.json`. Eles não foram executados nesta revisão documental.

## Organização do código

```text
src/
├── components/
│   ├── cadastros/
│   ├── layout/
│   └── ui/
├── pages/              # Dashboard, etiquetas, produção, cadastros e gestão
├── repositories/       # Operações de cadastro com armazenamento local
├── services/
│   ├── storage/        # localStorage, importação e exportação de dados
│   └── fiscal/         # Integração externa ainda não implementada
├── types/              # Tipos das entidades
├── utils/              # Formatação e cálculos
├── App.tsx
└── main.tsx
```

## Persistência e limitações

**Os dados são locais ao navegador e ao perfil usado.** Isso significa que:

- Os cadastros não são sincronizados automaticamente entre computadores.
- A limpeza do armazenamento do navegador pode apagar registros.
- Não há autenticação multiusuário ou backend de produção confirmados nesta versão.
- A classe de integração fiscal contém uma função não implementada, portanto a tela de notas fiscais **não representa emissão fiscal real**.

O módulo de armazenamento inclui funções de **exportação e importação** dos registros para backup local. Use dados fictícios para demonstrações públicas e não trate esta versão como sistema de gestão de produção pronto para operação crítica sem uma camada de persistência e segurança adequada.

## Próximas melhorias

- [ ] Criar backend e banco de dados centralizado com autenticação e permissões.
- [ ] Implementar sincronização, backups e rastreabilidade de alterações.
- [ ] Cobrir a leitura de PDF e os cálculos de produção com testes automatizados.
- [ ] Melhorar a validação de documentos e as mensagens de erro.
- [ ] Implementar integrações fiscais somente após definir requisitos legais e operacionais.

## Autoria

Desenvolvido por **Kaue Borges** como projeto de sistema de confecção e automação de processos.
