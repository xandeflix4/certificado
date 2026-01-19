# 🚀 Guia de Deploy - Vercel + Supabase

## 📋 Pré-requisitos
- Conta no [Supabase](https://supabase.com) (gratuito)
- Conta no [Vercel](https://vercel.com) (gratuito)
- Código no GitHub (já feito ✅)

---

## Parte 1: Configurar Supabase (Banco de Dados)

### 1.1 Criar Projeto no Supabase
1. Acesse [app.supabase.com](https://app.supabase.com)
2. Clique em **"New Project"**
3. Preencha:
   - **Name**: `certificamaster` (ou outro nome)
   - **Database Password**: Crie uma senha forte e **guarde**
   - **Region**: `South America (São Paulo)` (mais próximo)
4. Aguarde 2-3 minutos até o projeto estar pronto

### 1.2 Configurar Banco de Dados
1. No painel do Supabase, vá em **SQL Editor** (ícone de código à esquerda)
2. Clique em **"New query"**
3. Copie TODO o conteúdo do arquivo `SUPABASE_SETUP.sql` (na raiz do projeto)
4. Cole no editor SQL
5. Clique em **"RUN"** (ou pressione Ctrl+Enter)
6. Você verá: ✅ **"Success. No rows returned"** (isso é normal e correto!)

### 1.3 Obter Credenciais
1. Vá em **Settings** > **API** (no menu lateral)
2. Copie os seguintes valores:
   - **Project URL**: `https://xxxxxxxxxx.supabase.co`
   - **anon/public key**: Uma chave longa começando com `eyJ...`

**🔐 Guarde esses valores!** Você vai precisar deles no próximo passo.

---

## Parte 2: Deploy na Vercel (Hospedagem)

### 2.1 Importar Projeto
1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New..."** > **"Project"**
3. Selecione **"Import Git Repository"**
4. Escolha o repositório: `xandeflix4/certificado`
5. Clique em **"Import"**

### 2.2 Configurar Variáveis de Ambiente
**ANTES** de clicar em "Deploy", configure as variáveis:

1. Na seção **"Environment Variables"**, adicione:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | Cole a **Project URL** do Supabase |
| `VITE_SUPABASE_ANON_KEY` | Cole a **anon/public key** do Supabase |

2. Certifique-se de que está marcado **Production**, **Preview** e **Development**

### 2.3 Deploy
1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. Quando aparecer **🎉 "Congratulations!"**, clique em **"Visit"**

---

## Parte 3: Primeiro Acesso

### 3.1 Criar Sua Conta
1. Abra o link da Vercel (algo como `certificamaster.vercel.app`)
2. Você verá a tela de **Login/Cadastro**
3. Clique em **"Não tem conta? Cadastre-se"**
4. Preencha:
   - **E-mail**: Seu e-mail
   - **Senha**: Uma senha forte
5. Clique em **"Cadastrar"**

### 3.2 Confirmar E-mail
1. Abra seu e-mail
2. Procure por um e-mail do Supabase com assunto: **"Confirm your signup"**
3. Clique no link de confirmação
4. Volte para o site e faça login

### 3.3 Pronto!
Agora você pode:
- ✅ Criar certificados
- ✅ Seus dados ficam salvos na nuvem
- ✅ Acessar de qualquer lugar

---

## 🔧 Configuração Local (Desenvolvimento)

Se quiser testar localmente antes de fazer deploy:

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edite o `.env` e preencha com suas credenciais do Supabase

3. Instale as dependências:
   ```bash
   npm install
   ```

4. Execute o projeto:
   ```bash
   npm run dev
   ```

---

## 📊 Verificação de Funcionamento

### ✅ Tudo funcionando se:
- Login/cadastro funciona
- Ao adicionar alunos, eles aparecem mesmo após refresh
- Ao fazer logout e login novamente, os dados continuam lá
- Não aparecem erros no console do navegador

### ❌ Problemas Comuns

**1. "Failed to fetch" ao fazer login**
- Verifique se as variáveis de ambiente estão corretas
- Verifique se o SQL foi executado no Supabase

**2. "Invalid login credentials"**
- Confirme seu e-mail clicando no link
- Verifique se digitou a senha corretamente

**3. Dados não salvam**
- Abra o Console (F12) e veja se há erros
- Verifique se executou o script SQL completo

---

## 🔒 Segurança

### Row Level Security (RLS) ✅
O banco de dados está configurado para que:
- ✅ Cada usuário vê APENAS seus próprios dados
- ✅ Ninguém pode acessar dados de outros usuários
- ✅ Mesmo se alguém obter a chave pública, não consegue ver dados alheios

### Próximos Passos para Produção
Se quiser melhorar ainda mais a segurança:
1. Configure um domínio personalizado na Vercel
2. Habilite autenticação de 2 fatores no Supabase
3. Configure backup automático no Supabase

---

## 📞 Suporte

### Logs da Vercel
- Acesse: Dashboard > Seu Projeto > Deployments > [último deploy] > **"View Function Logs"**

### Logs do Supabase
- Acesse: Seu Projeto > **Logs** (menu lateral)

### Verificar Status
- Vercel: [status.vercel.com](https://status.vercel.com)
- Supabase: [status.supabase.com](https://status.supabase.com)

---

<div align="center">

## 🎉 Parabéns!

Seu **CertificaMaster** agora está **ONLINE** e **100% funcional**!

🌐 **Acesse de qualquer lugar**  
☁️ **Dados seguros na nuvem**  
🔒 **Totalmente privado**

</div>
