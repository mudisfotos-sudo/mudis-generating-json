# ERP JSON Designer

Aplicação construída com Next.js para modelar entidades de um ERP por meio de descrições JSON. O sistema permite:

- Cadastro e autenticação de usuários.
- Criação de projetos para organizar as entidades do ERP.
- Criação, edição, listagem e remoção de entidades seguindo a tipagem `DataBaseEntityType`.
- Edição visual das propriedades avançadas (campos, relacionamentos, layouts de vistas, componentes e filtros).
- Persistência dos dados em MongoDB.

## Requisitos

- Node.js 18 ou superior.
- Banco de dados MongoDB acessível pela aplicação.

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com os valores abaixo:

```env
MONGODB_URI=mongodb://localhost:27017/erp-json-designer
AUTH_SECRET=alterar-para-um-segredo-seguro
```

## Scripts

```bash
npm install
npm run dev     # Ambiente de desenvolvimento
npm run build   # Build de produção
npm run start   # Executa a versão compilada
npm run lint    # Analisa o código com ESLint
```

A aplicação será iniciada em `http://localhost:3000`.

## Estrutura principal

- `app/` — Rotas do Next.js, incluindo APIs e páginas protegidas.
- `components/` — Componentes reutilizáveis para formulários, dashboards e editores.
- `lib/` — Conexão com o banco, modelos Mongoose, utilitários de autenticação e validações.
- `types/` — Tipagens completas utilizadas para compor os JSONs das entidades.

## Executando os fluxos principais

1. Crie uma conta em `/register` e acesse o painel `/dashboard`.
2. Cadastre um projeto e adicione entidades com o editor visual.
3. Configure campos, relacionamentos e layouts de forma guiada.
4. Utilize as ações da interface para salvar, atualizar ou remover entidades.

O painel gera automaticamente os objetos `DataBaseEntityType` que podem ser exportados via API para consumo pelo seu ERP.
