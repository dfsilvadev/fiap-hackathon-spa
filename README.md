# FIAP Hackathon SPA

SPA em React com TypeScript para o **Módulo Pedagógico** — plataforma de acompanhamento de alunos com dificuldade. Interface para alunos (trilhas, conteúdos, avaliações, recomendações) e para professores/coordenadores (gestão de usuários, conteúdos, trilhas e avaliações).

## Backend

A API REST que consome esta SPA está em um repositório separado:

- **[fiap-hackathon](https://github.com/dfsilvadev/fiap-hackathon)** — Backend (Node/Express, Prisma, PostgreSQL)

Para rodar o projeto completo, suba o backend conforme o README do repositório acima e configure a URL da API no frontend (veja [Variáveis de ambiente](#variáveis-de-ambiente)).

## Design

Protótipo e especificações visuais da interface no Figma:

- **[Figma — FIAP Hackathon SPA](https://www.figma.com/design/aQuxWCx4fiwvHBggasx9jo/Untitled?node-id=0-1&t=4dYWyvEvotc8zAl6-1)**

## Stack

- **React** 19 + **TypeScript**
- **Vite** – build e dev server
- **React Router** v7
- **Axios** – HTTP client (ApiPublic / ApiPrivate com Bearer token)
- **Tailwind CSS** – estilos e design system (variáveis CSS)
- **Formik** + **Yup** / **Zod** – formulários e validação
- **i18next** + **react-i18next** – i18n (pt/en)
- **Phosphor Icons** (`@phosphor-icons/react`)
- **@uiw/react-md-editor** + **react-markdown** – editor e exibição de conteúdo
- **ESLint** + **Prettier** – lint e formatação
- **Husky** + **lint-staged** – hooks de pre-commit
- **Vitest** + **Testing Library** – testes

## Scripts

| Comando                 | Descrição                      |
| ----------------------- | ------------------------------ |
| `npm run dev`           | Servidor de desenvolvimento    |
| `npm run build`         | Build de produção              |
| `npm run preview`       | Preview do build               |
| `npm run lint`          | ESLint                         |
| `npm run lint:fix`      | ESLint com correção automática |
| `npm run format`        | Prettier (write)               |
| `npm run format:check`  | Verifica formatação Prettier   |
| `npm run test`          | Vitest em modo watch           |
| `npm run test:run`      | Vitest uma vez                 |
| `npm run test:coverage` | Vitest com cobertura           |

## Variáveis de ambiente

Crie um arquivo `.env` na raiz (ou use `.env.local`). Exemplo:

```env
VITE_API_URL=http://localhost:3001/api
```

- **VITE_API_URL** – URL base da API (backend). Em desenvolvimento local, use a porta em que o backend está rodando (ex.: `3001` com Docker ou `3000` se rodar `npm run dev` no backend).
- **VITE_API_TIMEOUT** – (opcional) Timeout das requisições em ms.

## Estrutura

```
src/
  pages/        – Páginas (listagens, CRUD, login, perfil, dashboard)
  router/       – React Router (client, rotas privadas, roles, routesMap)
  layout/       – BaseLayout (sidebar + Outlet), AuthLayout
  components/   – Sidebar, inputs, MarkdownEditor, cards de assessment, etc.
  hooks/        – useAuth (login, logout, user, me)
  lib/          – axios (ApiPublic, ApiPrivate, get/post/put/patch/del)
  services/     – assessmentService, learningPathService, contentService
  resources/    – authResources, userResources, contentResources, etc.
  constants/    – assessment (níveis, tipos de questão), content (séries, níveis)
  util/ e utils/ – formatDate, loggers
  i18n.ts       – Configuração i18next
public/         – Assets estáticos
```

## Pré-commit

No `git commit`, o Husky executa o **lint-staged** (ESLint e Prettier nos arquivos staged). É necessário ter Git inicializado e ter rodado `npm install` (que executa o `prepare` do Husky).

## Início rápido

1. **Instalar dependências:**

   ```bash
   npm install
   ```

2. **Configurar a API:** crie `.env` com `VITE_API_URL` apontando para o backend (ex.: `http://localhost:3001/api`).

3. **Subir o frontend:**

   ```bash
   npm run dev
   ```

   Acesse [http://localhost:5173](http://localhost:5173).

4. **Backend:** para login e dados reais, rode o [backend](https://github.com/dfsilvadev/fiap-hackathon) (Node/Express + Prisma). Usuário de teste após o seed: `admin@example.com` / `Admin@123`.
