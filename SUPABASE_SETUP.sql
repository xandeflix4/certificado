-- RODE ESTE SCRIPT NO "SQL EDITOR" DO SEU PAINEL SUPABASE

-- 1. Cria a tabela para armazenar os dados do usuário (CertificaMaster)
create table user_data (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  content jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Garante que cada usuário tenha apenas UMA linha de dados (Singleton pattern por usuário)
  unique(user_id)
);

-- 2. Habilita segurança (Row Level Security)
alter table user_data enable row level security;

-- 3. Cria políticas de segurança
-- Permitir que o usuário veja APENAS seus próprios dados
create policy "Users can select their own data"
  on user_data for select
  using ( auth.uid() = user_id );

-- Permitir que o usuário insira seus próprios dados
create policy "Users can insert their own data"
  on user_data for insert
  with check ( auth.uid() = user_id );

-- Permitir que o usuário atualize seus próprios dados
create policy "Users can update their own data"
  on user_data for update
  using ( auth.uid() = user_id );
