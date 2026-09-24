# Sistema de Confecção — Costuras Hoinatz

Aplicação React + Vite + TypeScript para leitura de sequência operacional em PDF e geração de etiquetas de produção.

## Fornecedores configurados

### Malwee
- Lê todas as páginas do PDF.
- Identifica automaticamente o código `100000xxxx`.
- Converte o código para a OP da etiqueta (`1000004430` → `4430`).
- Extrai as operações e calcula `PC/H` com `Math.floor(60 / tempo)`.

### Elian
- A OP é informada manualmente no formulário.
- Lê a tabela de `Sequência Operacional - Custos Padrão` diretamente pelos itens do PDF.
- Identifica código da operação, descrição, máquina, tempo e PC/Hr.
- Detecta automaticamente as grades do documento (ex.: `2 - 01/03` e `3 - 4/8`).
- Quando o PDF possui mais de uma grade, o dashboard mostra um seletor para escolher qual grade será usada na etiqueta.
- O cálculo exibido continua usando `Math.floor(60 / tempo)` para manter a mesma regra do sistema.

Mapeamentos Elian já tratados no modelo de etiqueta incluem:
- `REMATAR OMBROS` → `(10) Fechar Ombros`
- `PREGAR MANGAS...` → `(11) Pregar Mangas`
- `REMATAR MANGAS... E LADOS` → `(13) Fechar Lados`
- `FAZER BAINHA CINTURA/BARRA...` → `(31) Bainha Barra`
- `FAZER TRAVETE SOBRE COSTURA DE COBERTURA` → `(28) Travetar Bainha`

As demais operações continuam visíveis na tabela de leitura e podem receber novos mapeamentos conforme novos modelos da Elian forem testados.

## Executar

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Identidade visual

O dashboard utiliza a identidade visual da Costuras Hoinatz com fundo escuro, amarelo da marca e a logo fornecida, sem alterar o layout de impressão da etiqueta.
