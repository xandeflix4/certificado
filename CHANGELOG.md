# 📋 Changelog - CertificaMaster

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

---

## [2.0.0] - 2026-01-19

### 🔒 **Segurança e Validação**

#### ✅ Adicionado
- **Validação de CPF**: Implementado algoritmo oficial de validação de CPF
  - Verifica dígitos verificadores
  - Rejeita CPFs sequenciais (111.111.111-11)
  - Aceita formato com ou sem pontuação
  
- **Validação de CNPJ**: Validador completo de CNPJ
  - Verifica dígitos verificadores
  - Rejeita CNPJs sequenciais
  
- **Validação de Campos Obrigatórios**:
  - Nome do curso
  - Razão social da empresa
  - Pelo menos 1 aluno
  - Pelo menos 1 instrutor
  - Texto do certificado preenchido
  
- **Validação de API Key**: Verifica se a API Key do Gemini está configurada antes de usar

#### 🔧 Corrigido
- **Variável de Ambiente**: Alterado de `GEMINI_API_KEY` para `VITE_GEMINI_API_KEY`
  - Vite só expõe variáveis com prefixo `VITE_` ao frontend
  - Código atualizado para usar `import.meta.env.VITE_GEMINI_API_KEY`
  
- **Modelo Gemini**: Atualizado de `gemini-3-flash-preview` para `gemini-2.0-flash-exp`

---

### 💾 **Persistência de Dados**

#### ✅ Adicionado
- **LocalStorage**: Sistema completo de persistência
  - Salvamento automático com debounce (1 segundo)
  - Carregamento automático ao iniciar (com confirmação)
  - Versionamento de dados para futuras migrações
  - Timestamp de quando foi salvo
  
- **Gerenciamento de Dados**:
  - Botão "LIMPAR TUDO" para resetar aplicação
  - Confirmação de segurança antes de limpar
  - Funções helper: `saveCertificateData()`, `loadCertificateData()`, `clearCertificateData()`

#### 📁 Arquivos Criados
- `utils/storage.ts`: Utilitário de persistência

---

### 🛡️ **Prevenção de Erros**

#### ✅ Adicionado
- **Confirmações de Exclusão**:
  - Confirmação ao remover aluno (mostra nome e CPF)
  - Confirmação ao remover instrutor (mostra nome)
  - Confirmação ao limpar todos os dados
  
- **Mensagens Melhoradas**:
  - Mensagens com emojis para melhor visibilidade
  - Feedback detalhado de sucesso/erro
  - Instruções claras em caso de erro

#### 🔧 Melhorado
- **Função `addStudent()`**:
  - Valida se nome está preenchido
  - Valida se CPF está preenchido
  - Valida formato de CPF antes de adicionar
  - Mensagens específicas para cada erro
  
- **Função `exportAllToPDF()`**:
  - Validação completa antes de iniciar
  - Mensagem de sucesso com contador
  - Mensagem de erro mais informativa

---

### 🎯 **Experiência do Usuário**

#### ✅ Adicionado
- **Feedback Visual**:
  - ✅ Emojis em mensagens de sucesso
  - ❌ Emojis em mensagens de erro
  - ⚠️ Emojis em avisos
  - ❓ Emojis em confirmações
  - 🗑️ Emoji no botão de limpar dados
  
- **Mensagens Contextuais**:
  - "X certificado(s) exportado(s)" após exportar
  - "Dados salvos automaticamente" no console
  - "Dados carregados do LocalStorage" no console

---

### 📚 **Documentação**

#### ✅ Adicionado
- **README.md Completo**:
  - Índice organizado
  - Instruções de instalação detalhadas
  - Tutorial de uso passo a passo
  - Tabela de variáveis disponíveis
  - Seção de troubleshooting
  - Estrutura do projeto documentada
  
- **CHANGELOG.md**: Este arquivo
  - Histórico detalhado de mudanças
  - Organização por categorias

#### 📁 Arquivos Criados
- `README.md`: Documentação completa
- `CHANGELOG.md`: Histórico de versões

---

### 🧪 **Estrutura de Código**

#### 📁 Arquivos Criados
- `utils/validators.ts`: Sistema de validação
  - `isValidCPF(cpf: string): boolean`
  - `isValidCNPJ(cnpj: string): boolean`
  - `validateCertificateData(data): ValidationError[]`
  - `formatValidationErrors(errors): string`
  
- `utils/storage.ts`: Sistema de persistência
  - `saveCertificateData(data): boolean`
  - `loadCertificateData(): any | null`
  - `clearCertificateData(): boolean`
  - `hasSavedData(): boolean`
  - `getSavedDataInfo(): object | null`

#### 🔧 Arquivos Modificados
- `App.tsx`:
  - +2 imports (validators, storage)
  - +2 useEffect hooks (load/save)
  - Validações em `addStudent()`
  - Validações em `exportAllToPDF()`
  - Confirmações em `removeStudent()`
  - Confirmações em `removeInstrutor()`
  - Botão "LIMPAR TUDO"
  
- `.env.local`:
  - Renomeado para `VITE_GEMINI_API_KEY`

---

## [1.0.0] - 2026-01-18

### 🎉 Versão Inicial

#### Funcionalidades
- Sistema básico de geração de certificados
- Cadastro de alunos
- Gestão de instrutores
- Grade curricular
- Personalização visual
- Exportação em PDF
- Integração com Gemini AI

---

## 🔮 Próximas Versões (Roadmap)

### [2.1.0] - Planejado
- [ ] Templates prontos de certificados
- [ ] Export individual (um PDF por aluno)
- [ ] Busca/filtro de alunos
- [ ] Histórico de exportações

### [2.2.0] - Planejado
- [ ] QR Code de validação
- [ ] Numeração automática de certificados
- [ ] Múltiplos idiomas
- [ ] Modo escuro

### [3.0.0] - Planejado
- [ ] Backend para API Gemini (segurança)
- [ ] Autenticação de usuários
- [ ] Banco de dados em nuvem
- [ ] Compartilhamento de templates
- [ ] API REST

---

## 📝 Legenda

- ✅ **Adicionado**: Novos recursos
- 🔧 **Corrigido**: Bugs corrigidos
- 🔄 **Alterado**: Mudanças em recursos existentes
- 🗑️ **Removido**: Recursos removidos
- 🔒 **Segurança**: Melhorias de segurança
- 📚 **Documentação**: Apenas documentação

---

<div align="center">
  <p>Mantido por Alexandre-Janaina</p>
</div>
