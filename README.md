# 🎓 CertificaMaster - Gerador de Certificados (100% Offline)

<div align="center">
  <h3>Plataforma completa para criação, personalização e exportação de certificados</h3>
  <p>✨ Design profissional • 🎨 Totalmente personalizável • 📦 Exportação em lote • 🔒 100% Privado</p>
  <p><strong>⚡ SEM dependência de APIs externas • 🚀 Funciona totalmente offline</strong></p>
</div>

---

## 🎯 Sobre o Projeto

O **CertificaMaster** é uma aplicação web moderna desenvolvida com React e TypeScript que permite criar certificados profissionais de forma rápida, eficiente e **completamente independente**.

### 🌟 Destaques da Versão 2.1.0:
- ✅ **100% Offline** - Funciona sem internet (após carregar)
- ✅ **Zero Configuração** - Não precisa de API Keys ou arquivos .env
- ✅ **Totalmente Privado** - Nenhum dado enviado para fora
- ✅ **Validação de CPF/CNPJ** - Algoritmos oficiais implementados
- ✅ **Persistência Automática** - Auto-save no navegador
- ✅ **Confirmações de Segurança** - Evita exclusões acidentais
- ✅ **Leve e Rápido** - 92 pacotes, build em 7.89s

---

## ⚡ Funcionalidades

### 📝 Gestão de Dados
- **Cadastro de Alunos**: Adicione múltiplos alunos com validação de CPF
- **Importação em Massa**: Cole listas de alunos (formato CSV/TSV)
- **Gestão de Instrutores**: Adicione instrutores com competências
- **Grade Curricular**: Crie e edite o conteúdo programático
- **Auto-Save**: Dados salvos automaticamente no LocalStorage

### 🎨 Personalização Visual
- **20+ Controles de Layout**: Ajuste fino de posições e espaçamentos
- **Fontes Customizáveis**: 10+ tamanhos ajustáveis
- **Upload de Imagens**: Fundo, assinaturas e selo digital
- **Alinhamento de Texto**: Esquerda, centro, direita ou justificado
- **Variáveis em Negrito**: Destaque informações importantes
- **Borda Customizável**: Ajuste a espessura da moldura

### 📄 Exportação
- **PDF de Alta Qualidade**: Exportação em formato A4 landscape
- **Geração em Lote**: Todos os certificados em um único PDF
- **Frente e Verso**: Certificado completo com grade curricular
- **Preview Completo**: Visualize antes de exportar

---

## 🚀 Instalação Rápida

### Pré-requisitos
- **Node.js** (versão 16 ou superior)

### Passo 1: Instalação
```bash
# Navegue até o diretório
cd certificamaster---gerador-de-certificados

# Instale as dependências
npm install
```

### Passo 2: Executar
```bash
# Modo desenvolvimento
npm run dev

# Abra no navegador
http://localhost:5173
```

### Passo 3: Usar
**Pronto! Não precisa configurar NADA!**

---

## 📖 Como Usar

### 1️⃣ **Aba "Alunos & Curso"**
1. **Adicione Alunos**:
   - Digite nome e CPF (com validação automática)
   - Ou use "Importação Massiva" para adicionar vários
   - Formato: `Nome Completo, 000.000.000-00`

2. **Adicione Instrutores**:
   - Nome do instrutor
   - Competências/Especialidades (opcional)

3. **Preencha Dados do Curso**:
   - Nome do curso (obrigatório)
   - Data de conclusão
   - Carga horária total
   - Dados da empresa

### 2️⃣ **Aba "Grade"**
- Adicione disciplinas e carga horária
- Total calculado automaticamente
- Configure visual da tabela

### 3️⃣ **Aba "Visual"**
- Ajuste dimensões e margens
- Personalize tamanhos de fonte
- Faça upload de imagens personalizadas
- Edite o texto do certificado

### 4️⃣ **Exportar**
1. Revise os certificados com os controles de navegação
2. Clique em "PRÉ-VISUALIZAR TUDO"
3. Clique em "EXPORTAR LOTE" para gerar o PDF

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Propósito |
|-----------|--------|-----------|
| **React** | 19.2 | Interface reativa |
| **TypeScript** | 5.8 | Tipagem e segurança |
| **Vite** | 6.2 | Build rápido |
| **TailwindCSS** | Latest (CDN) | Design moderno |
| **jsPDF** | 3.0 | Geração de PDFs |
| **html2canvas** | 1.4 | Renderização |

**Total**: 92 pacotes NPM

---

## 🎨 Variáveis Disponíveis

Use estas variáveis no texto do certificado:

| Variável | Descrição |
|----------|-----------|
| `{{NOME}}` | Nome do aluno |
| `{{CPF}}` | CPF formatado |
| `{{CURSO}}` | Nome do curso |
| `{{DATA}}` | Data de conclusão |
| `{{CARGA_HORARIA}}` | Carga horária total |
| `{{RAZAO_SOCIAL}}` | Razão social da empresa |
| `{{CNPJ}}` | CNPJ da empresa |
| `{{ENDERECO}}` | Endereço da empresa |
| `{{INSTRUTORES}}` | Lista de instrutores |

**Exemplo de texto**:
```
Certificamos que {{NOME}}, portador do CPF {{CPF}}, 
concluiu com êxito o curso de {{CURSO}}, realizado 
em {{DATA}}, com carga horária total de {{CARGA_HORARIA}} 
horas, sob a responsabilidade de {{RAZAO_SOCIAL}}, 
CNPJ {{CNPJ}}.
```

---

## 🔒 Privacidade e Segurança

### ✅ **100% Privado**
- Todos os dados permanecem no seu navegador
- Nenhuma informação é enviada para servidores externos
- Não há rastreamento ou analytics
- Não há dependências de APIs de terceiros

### ✅ **Dados Salvos Localmente**
- LocalStorage do navegador
- Versionamento para futuras migrações
- Pode limpar a qualquer momento

### ✅ **Validações Implementadas**
- CPF: Algoritmo oficial com dígitos verificadores
- CNPJ: Algoritmo oficial completo
- Campos obrigatórios antes de exportar
- Confirmações antes de excluir

---

## 📁 Estrutura do Projeto

```
certificamaster---gerador-de-certificados/
│
├── components/
│   ├── CertificatePreview.tsx   # Renderização do certificado
│   ├── CurriculumTable.tsx      # Grade curricular
│   └── FormInput.tsx            # Input reutilizável
│
├── utils/
│   ├── helpers.ts               # Formatação e variáveis
│   ├── validators.ts            # Validações (CPF, CNPJ)
│   └── storage.ts               # Persistência LocalStorage
│
├── App.tsx                      # Componente principal
├── types.ts                     # Definições TypeScript
├── package.json                 # Dependências (92 pacotes)
└── README.md                    # Este arquivo
```

---

## 🐛 Solução de Problemas

### **"CPF inválido"**
- Verifique se digitou todos os 11 dígitos
- Formatos aceitos: `000.000.000-00` ou `00000000000`
- Não use CPFs falsos/sequenciais

### **"Campos obrigatórios faltando"**
Antes de exportar, certifique-se de ter:
- ✅ Pelo menos 1 aluno
- ✅ Nome do curso preenchido
- ✅ Razão social da empresa
- ✅ Pelo menos 1 instrutor
- ✅ Texto do certificado

### **PDF não gera**
- Aguarde o carregamento das imagens
- Teste com menos alunos primeiro
- Verifique se todos os campos estão preenchidos

### **Perdi meus dados**
- Dados ficam no LocalStorage do navegador
- Limpar cache/histórico apaga os dados
- Use o botão "EXPORTAR LOTE" regularmente como backup

---

## 📝 Changelog

### [2.1.0] - 2026-01-19 - **Versão Independente**

#### 🗑️ Removido
- Dependência do Google Gemini API (@google/genai)
- 78 pacotes relacionados à IA
- Arquivo .env.local
- Botão "Polir com IA"
- Função enhanceTextWithGemini

#### ✅ Melhorias
- Bundle 47 kB menor (894 → 847 kB)
- Build 2.5s mais rápido (10.4 → 7.9s)
- Zero configuração necessária
- 100% independente de APIs externas
- Dica de variáveis disponíveis no campo de texto

### [2.0.0] - 2026-01-19

#### ✅ Adicionado
- Validação completa de CPF e CNPJ
- Persistência automática (LocalStorage)
- Confirmações antes de excluir
- Validações de campos obrigatórios
- Mensagens claras de feedback

---

## 🎯 Características Técnicas

### Performance
- ⚡ Build em **7.89s**
- 📦 Bundle final: **847 kB** (gzip: 249 kB)
- 🚀 92 pacotes NPM (78 a menos que v2.0)
- 💾 Tamanho total instalado: ~45 MB

### Compatibilidade
- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ✅ Safari
- ⚠️ IE não suportado

### Requisitos do Sistema
- Node.js 16+
- 50 MB de espaço em disco
- Navegador moderno

---

## 🤝 Contribuições

Este é um projeto de código aberto. Sinta-se livre para:
- Reportar bugs
- Sugerir melhorias
- Fazer fork e modificar

---

## 📄 Licença

Este projeto é fornecido "como está", para uso educacional e comercial.

---

<div align="center">

## 🎓 CERTIFICAMASTER v2.1.0

### ✅ 100% Offline • 🔒 100% Privado • ⚡ Zero Configuração

**Desenvolvido com ❤️ para ser simples e eficiente**

---

**Gerando certificados profissionais desde 2026**

</div>
