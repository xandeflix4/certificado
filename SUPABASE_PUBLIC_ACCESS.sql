-- SCRIPT PARA PERMITIR ACESSO PÚBLICO (SEM AUTENTICAÇÃO)
-- Execute este script no SQL Editor do Supabase

-- 1. Remover políticas antigas
DROP POLICY IF EXISTS "Users can select their own data" ON user_data;
DROP POLICY IF EXISTS "Users can insert their own data" ON user_data;
DROP POLICY IF EXISTS "Users can update their own data" ON user_data;

-- 2. Criar políticas públicas (todos podem acessar)
CREATE POLICY "Acesso público para leitura"
  ON user_data FOR SELECT
  USING (true);

CREATE POLICY "Acesso público para inserção"
  ON user_data FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Acesso público para atualização"
  ON user_data FOR UPDATE
  USING (true);

-- 3. Inserir registro compartilhado se não existir
INSERT INTO user_data (user_id, content, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '{}'::jsonb,
  NOW()
)
ON CONFLICT (user_id) DO NOTHING;
