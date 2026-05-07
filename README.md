# Álbum 2026

Aplicação web mobile-first para controlar figurinhas do álbum da Copa do Mundo 2026. O app funciona sem login usando `localStorage`; quando Supabase está configurado, o usuário também pode entrar com email/senha ou Google e salvar o progresso no Postgres.

## Funcionalidades

- Marcar figurinhas como faltando, tenho ou repetidas.
- Acompanhar progresso geral e por seleção.
- Buscar seleções por nome ou sigla.
- Exportar/importar backup em JSON.
- Compartilhar o app por QR code.
- Usar sem login com salvamento local.
- Usar com login e sincronização em nuvem via Supabase.

## Rodando localmente

```bash
npm install
npm run dev
```

Sem `.env`, o app roda normalmente em modo local. O botão de conta mostra que o Supabase ainda não foi configurado.

## Configurando Supabase

1. Crie um projeto em https://supabase.com.
2. No painel do Supabase, abra `SQL Editor`.
3. Rode este SQL:

```sql
create table if not exists public.album_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  progress jsonb not null default '[]'::jsonb,
  preferences jsonb not null default '{}'::jsonb,
  ui jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.album_progress enable row level security;

create policy "Users can read their own album progress"
on public.album_progress
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own album progress"
on public.album_progress
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own album progress"
on public.album_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own album progress"
on public.album_progress
for delete
to authenticated
using (auth.uid() = user_id);
```

4. Em `Authentication > Providers > Email`, deixe email/senha habilitado.
5. Para Google:
   - Em `Authentication > Providers > Google`, habilite o provider.
   - Crie as credenciais OAuth no Google Cloud.
   - Configure no Google Cloud o callback informado pelo Supabase.
   - Em `Authentication > URL Configuration`, adicione a URL local e a URL da Vercel em `Redirect URLs`.

Exemplos:

```text
http://localhost:5173
http://localhost:5174
https://marcos-brito-copa-do-mundo-2026.vercel.app
```

## Variáveis de ambiente

Crie um arquivo `.env` local com:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-anon
```

Esses valores ficam em:

- `Project Settings > API > Project URL`
- `Project Settings > API > Project API keys > anon public`

Depois rode:

```bash
npm run dev
```

## Deploy na Vercel

Você não precisa mudar a estrutura do deploy. O app continua sendo um Vite estático hospedado na Vercel.

O que muda:

1. No projeto da Vercel, abra `Settings > Environment Variables`.
2. Cadastre:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Faça um novo deploy.
4. No Supabase, adicione a URL final da Vercel nas URLs permitidas de autenticação.

Importante: a `anon key` do Supabase é pública por design. A segurança fica nas políticas de Row Level Security acima.

## Como validar o backend

1. Rode o app local com `.env`.
2. Abra o botão de conta no topo.
3. Crie uma conta com email e senha.
4. Marque algumas figurinhas.
5. Clique em `Salvar na nuvem`.
6. No Supabase, abra `Table Editor > album_progress` e confirme que existe uma linha para o usuário.
7. Abra outro navegador ou aba anônima.
8. Faça login com a mesma conta.
9. Clique em `Carregar da nuvem`.
10. O progresso salvo deve aparecer.

Para validar Google:

1. Clique em `Entrar com Google`.
2. Complete o login.
3. Volte para o app.
4. Marque figurinhas e salve na nuvem.
5. Confira a tabela `album_progress`.

## Comportamento de salvamento

- Sem login: salva apenas no `localStorage`.
- Com login: continua salvando no `localStorage` e permite salvar/carregar do Supabase.
- Ao marcar figurinhas com usuário logado, o app tenta sincronizar automaticamente com a nuvem.
- Se não existir progresso remoto, ao carregar da nuvem o app envia o progresso local atual.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test
```
