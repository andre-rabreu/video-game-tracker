# Video Game Tracker

Aplicação web para gerenciar sua coleção pessoal de jogos, com três status (Jogando, Na Fila, Concluídos) e busca de títulos via [RAWG API](https://rawg.io/apidocs).

Construída com **Next.js 16 (App Router)** e **React 19**, persistência em **AWS RDS MySQL** e segredos gerenciados pelo **AWS Secrets Manager**.

## Stack

- **Framework:** Next.js 16.2 (App Router) + React 19
- **Linguagem:** TypeScript 5
- **Estilo:** Tailwind CSS 4
- **Ícones:** lucide-react
- **Banco de dados:** AWS RDS MySQL 8 (driver `mysql2`)
- **Hash de senhas:** bcrypt
- **Segredos:** AWS Secrets Manager (`@aws-sdk/client-secrets-manager`)
- **API externa:** RAWG (catálogo de jogos)

## Estrutura do projeto

```
.
├── app/
│   ├── api/
│   │   ├── auth/route.ts            # POST /api/auth          → login
│   │   ├── auth/register/route.ts   # POST /api/auth/register → cadastro
│   │   ├── games/route.ts           # GET, POST /api/games    → listar/adicionar
│   │   ├── games/[id]/route.ts      # PATCH, DELETE           → atualizar/remover
│   │   └── search/route.ts          # GET /api/search         → proxy RAWG
│   ├── dashboard/page.tsx           # coleção do usuário (abas por status)
│   ├── search/page.tsx              # busca de jogos
│   ├── page.tsx                     # tela de login/cadastro
│   ├── layout.tsx                   # shell raiz (tema dark, fontes Geist)
│   └── globals.css
├── components/
│   ├── GameCard.tsx                 # card do dashboard
│   ├── KanbanColumn.tsx
│   ├── SearchResultCard.tsx
│   └── StatusSelect.tsx
├── lib/
│   ├── aws-secrets.ts               # busca + cache do segredo do RDS
│   ├── mysql.ts                     # pool MySQL singleton
│   ├── api-fetch.ts                 # wrapper de fetch com sliding session
│   ├── session.ts                   # sessão em localStorage (1h, sliding)
│   └── types.ts
├── scripts/
│   ├── schema.sql                   # DDL das tabelas
│   └── setup-db.js                  # cria as tabelas no RDS
└── .env.local                       # RAWG_API_KEY
```

## Modelo de dados

Banco: `tracker_db`

```sql
CREATE TABLE usuarios (
  id       VARCHAR(36)  PRIMARY KEY,   -- UUID gerado no servidor
  username VARCHAR(50)  NOT NULL,
  email    VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,      -- bcrypt
  UNIQUE KEY uk_usuarios_email (email),
  UNIQUE KEY uk_usuarios_username (username)
);

CREATE TABLE jogos_usuario (
  id         VARCHAR(36) PRIMARY KEY,
  usuario_id VARCHAR(36) NOT NULL,
  jogo_id    VARCHAR(50) NOT NULL,     -- ID do jogo na RAWG
  titulo     VARCHAR(255) NOT NULL,
  capa_url   TEXT,
  status     ENUM('playing','to_play','completed') NOT NULL,
  CONSTRAINT fk_jogos_usuario_usuarios
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_jogos_usuario_usuario (usuario_id)
);
```

## Endpoints HTTP

| Método | Rota                  | Descrição                                              |
| ------ | --------------------- | ------------------------------------------------------ |
| POST   | `/api/auth/register`  | Cria usuário (`username`, `email`, `password`).        |
| POST   | `/api/auth`           | Autentica via `email` + `password` e devolve `userId`. |
| GET    | `/api/games?userId=…` | Retorna a coleção agrupada por status.                 |
| POST   | `/api/games`          | Adiciona um jogo à coleção do usuário.                 |
| PATCH  | `/api/games/[id]`     | Atualiza o `status` de um item.                        |
| DELETE | `/api/games/[id]`     | Remove um item.                                        |
| GET    | `/api/search?query=…` | Busca jogos na RAWG (proxy server-side).               |

Status válidos: `playing`, `to_play`, `completed`.

## Sessão e segurança

- Sessão armazenada em `localStorage` no cliente, com **timeout de 1h e sliding expiration** ([lib/session.ts](lib/session.ts)).
- Toda chamada autenticada passa por [`apiFetch`](lib/api-fetch.ts), que renova a expiração quando a resposta é OK e redireciona para `/` em caso de sessão expirada.
- Senhas são armazenadas com hash bcrypt (custo 10).
- O segredo de credenciais do RDS é buscado pelo Secrets Manager e mantido em cache em memória por 10 minutos ([lib/aws-secrets.ts](lib/aws-secrets.ts)).

> O endpoint do RDS está hardcoded em `aws-secrets.ts` porque o segredo gerenciado pelo RDS não inclui `host`/`port`. O segredo guarda apenas `username`/`password`.

## Variáveis e configuração

Arquivo `.env.local`:

```
RAWG_API_KEY=...
```

Credenciais AWS (para acessar o Secrets Manager) precisam estar configuradas no ambiente — via `~/.aws/credentials`, `aws-vault`, IAM Role da instância em produção, etc.

## Como rodar

Pré-requisitos:
- Node.js 20+
- Acesso ao RDS e ao Secret no AWS Secrets Manager
- Chave da API RAWG em `.env.local`

```bash
# 1. Instalar dependências
npm install

# 2. Criar as tabelas no RDS (executa scripts/schema.sql)
node scripts/setup-db.js

# 3. Subir em modo dev
npm run dev
```

A aplicação fica disponível em http://localhost:3000.

### Scripts disponíveis

| Script          | Comando        | Descrição                       |
| --------------- | -------------- | ------------------------------- |
| `npm run dev`   | `next dev`     | Servidor de desenvolvimento.    |
| `npm run build` | `next build`   | Build de produção.              |
| `npm start`     | `next start`   | Servidor em modo produção.      |
| `npm run lint`  | `eslint`       | Lint do projeto.                |

## Fluxo do usuário

1. **Login/Cadastro** em `/` — abas para entrar ou criar conta. Após login, sessão de 1h é gravada e o usuário vai para o dashboard.
2. **Dashboard** em `/dashboard` — três abas (Jogando, Na Fila, Concluídos) com a coleção em grid. É possível alterar o status de um item (PATCH) ou removê-lo (DELETE).
3. **Buscar jogos** em `/search` — consulta a RAWG via proxy `/api/search` e permite adicionar o jogo à coleção em qualquer status (POST).
4. **Logout** limpa a sessão e volta para `/`.

## Convenções do projeto

- Toda comunicação UI em **pt-BR**.
- Tema dark fixo no `<html>` raiz.
- Mensagens de erro retornadas pelas rotas em pt-BR e exibidas direto na UI.
- Commits seguem **Conventional Commits 1.0.0** (`feat`, `fix`, `chore`, etc.) com descrição em pt-BR.

## Notas sobre a versão do Next.js

Esta versão do Next.js (16.2) tem mudanças relevantes em relação a versões anteriores. Sempre consulte a documentação local em `node_modules/next/dist/docs/` antes de adotar APIs ou padrões — alguns comportamentos do App Router e dos Route Handlers diferem do que aparece na maioria dos exemplos públicos.
