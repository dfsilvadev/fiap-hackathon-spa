# FIAP Hackathon SPA

SPA em React com TypeScript, criada com Vite.

## Stack

- **React** + **TypeScript**
- **Vite** – build e dev server
- **ESLint** + **Prettier** – lint e formatação
- **Husky** + **lint-staged** – hooks de pre-commit (lint + format nos arquivos staged)
- **Vitest** + **Testing Library** – testes
- **Tailwind CSS** – estilos
- **React Router** v7
- **Axios** – HTTP client
- **i18next** + **react-i18next** – i18n
- **Phosphor Icons** (`@phosphor-icons/react`)
- **Zod** e **Yup** – validação de schemas

## Scripts

| Comando           | Descrição                    |
|-------------------|-----------------------------|
| `npm run dev`     | Sobe o servidor de desenvolvimento |
| `npm run build`   | Build de produção           |
| `npm run preview` | Preview do build            |
| `npm run lint`    | Roda o ESLint               |
| `npm run lint:fix`| ESLint com correção automática |
| `npm run format`  | Formata com Prettier        |
| `npm run format:check` | Verifica formatação Prettier |
| `npm run test`    | Vitest em modo watch        |
| `npm run test:run`| Vitest uma vez              |
| `npm run test:coverage` | Vitest com cobertura   |

## Estrutura

- `src/` – código fonte
  - `pages/` – páginas (ex.: `HomePage`)
  - `lib/` – utilitários (axios, exemplos de validação Zod/Yup)
  - `router.tsx` – configuração do React Router
  - `i18n.ts` – configuração do i18next
- `public/` – assets estáticos
- `vitest.config.ts` – configuração do Vitest (separada do Vite)

## Pré-commit

Ao dar `git commit`, o Husky executa o **lint-staged**, que roda ESLint e Prettier nos arquivos staged. Para o hook funcionar, é necessário ter o repositório inicializado com Git e ter rodado `npm install` (que executa `husky` via script `prepare`).

## Início rápido

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).
