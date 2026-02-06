# Smell Selector UI

Interface web para visualizar, selecionar e gerenciar test smells detectados no projeto de pesquisa.

## 🎯 Propósito

Esta aplicação permite:
- **Visualizar** test smells detectados pelas ferramentas Steel e SNutsJS
- **Selecionar** smells específicos para estudo e refatoração
- **Anotar** observações e prioridades para cada smell
- **Filtrar** por repositório, tipo de smell e ferramenta de detecção
- **Gerenciar** smells selecionados no banco de dados SQLite

## 🏗️ Arquitetura

- **Frontend**: React 18 + Vite + CSS Modules
- **Backend**: FastAPI (Python) + SQLAlchemy ORM
- **Database**: SQLite (`research_data/research.db`)
- **Syntax Highlighting**: Prism.js (futuro)

### Database Access Pattern
O backend utiliza **SQLAlchemy ORM** de forma unificada:
- ✓ Modelos definidos em `llm-refactor-pipeline/src/llm_refactor/modules/database/models.py`
- ✓ Operações CRUD em `llm-refactor-pipeline/src/llm_refactor/modules/database/crud.py`
- ✓ Todas as operações de UI metadata usam funções CRUD (não raw SQL)
- ✓ Constraints e relacionamentos gerenciados pelo ORM
- ✓ Facilita migração para PostgreSQL se necessário

## 🚀 Como Iniciar

### Pré-requisitos

1. Python 3.8+ com dependências instaladas
2. Node.js 18+ e npm
3. Banco de dados `research.db` com smells detectados

### Opção 1: Script Automático (Recomendado)

```bash
cd smell-selector-ui
./start.sh
```

Este script:
- Aplica migrações no banco de dados
- Instala dependências do backend e frontend
- Inicia ambos os servidores automaticamente
- Abre o navegador em http://localhost:5173

### Opção 2: Manual

**Terminal 1 - Backend:**
```bash
cd smell-selector-ui/backend

# Instalar dependências
pip install -r requirements.txt

# Aplicar migração do banco (apenas na primeira vez)
python migrate_database.py

# Iniciar servidor FastAPI
python main.py
```
Backend roda em: http://localhost:8001

**Terminal 2 - Frontend:**
```bash
cd smell-selector-ui/frontend

# Instalar dependências
npm install

# Iniciar dev server
npm run dev
```
Frontend roda em: http://localhost:5173

### Opção 3: Via LLM Pipeline

```bash
cd llm-refactor-pipeline
python -m llm_refactor

llm-refactor> ui
# Inicia automaticamente backend + frontend
```

## 📋 Workflow Típico

### 1. Detectar Smells (se ainda não fez)

```bash
cd llm-refactor-pipeline
python -m llm_refactor

llm-refactor> /analyze-smells redux-offline
# ou
llm-refactor> /analyze-smells all
```

Isto popula a tabela `detected_smells` no banco de dados.

### 2. Abrir a UI

```bash
cd smell-selector-ui
./start.sh
```

### 3. Explorar Smells na Interface

1. **Filtrar**: Use os dropdowns no topo para filtrar por:
   - Repositório (ex: redux-offline, winston)
   - Tipo de smell (ex: Assertion Roulette, Eager Test)
   - Ferramenta (Steel ou SNutsJS)
   - Status (Selecionado ou não)

2. **Visualizar**: Clique em um smell na lista esquerda para ver:
   - Detalhes completos do smell
   - Código fonte do arquivo
   - Linhas específicas onde o smell ocorre

3. **Anotar**: Adicione observações sobre o smell:
   - Notas sobre complexidade
   - Estratégia de refatoração sugerida
   - Dificuldade esperada

4. **Selecionar**: Marque como "Select for Study"
   - Smell é movido para a tabela `study_smells`
   - Fica disponível para experimentos de refatoração

### 4. Executar Refatorações (Futuro)

No futuro, você poderá:
- Criar experimentos diretamente da UI
- Testar diferentes estratégias (zero-shot, CoT, few-shot)
- Comparar diferentes LLMs (Claude, GPT, Gemini)
- Ver resultados lado a lado

## 🗂️ Estrutura do Banco de Dados

### Tabelas Principais

```
detected_smells       → Todos os smells encontrados (source of truth)
study_smells          → Smells selecionados para estudo
smell_ui_metadata     → Anotações, prioridade, tags (dados da UI)
experiments           → Tentativas de refatoração (futuro)
```

### Relacionamentos

- `detected_smells` → FK: `file_id`
- `study_smells` → FK: `file_id`
- `smell_ui_metadata` → FK: `detected_smell_id`
- `experiments` → FK: `study_smell_id`

### Fluxo de Dados

```
Detection (Steel/SNutsJS)
    ↓
detected_smells table
    ↓
UI Selection
    ↓
study_smells table + smell_ui_metadata
    ↓
Refactoring (Future)
    ↓
experiments table
```

## 🔌 API Endpoints

### Repositórios
- `GET /api/repositories` - Lista repos com contagem de smells

### Smells
- `GET /api/smells?repo=...&smell_type=...&tool=...` - Lista smells com filtros
- `GET /api/smells/{id}` - Detalhes de um smell + código completo
- `POST /api/smells/{id}/select` - Selecionar para estudo
- `DELETE /api/smells/{id}/unselect` - Desselecionar
- `PATCH /api/smells/{id}/metadata` - Atualizar anotações/prioridade

### Study Smells
- `GET /api/study-smells` - Lista todos selecionados

### Filtros e Metadados (NOVO)
- `GET /api/filter-options` - Opções de filtro dinâmicas (ferramentas e tipos)
- `GET /api/smell-catalog` - Catálogo completo com descrições e guias

### Export (NOVO)
- `GET /api/export-selected-smells` - Exporta smells selecionados para CSV
- `GET /api/export-all-smells?repo=...&smell_type=...&tool=...` - Exporta com filtros

### Estatísticas
- `GET /api/stats` - Estatísticas gerais do banco

**Ferramentas de Detecção**:
- **SNUTSJS** - SNutsJS test smell detector
- **Steel** - Steel test smell detector

**10 Primary Research Smells**:
1. Assertion Roulette
2. Duplicate Assert
3. Magic Number
4. Lazy Test
5. Redundant Print
6. Suboptimal Assertion
7. Conditional Test Logic
8. Overcommitted Test
9. Test Without Description
10. Sensitive Equality

Documentação completa: http://localhost:8001/docs

## 🎨 Interface

### Layout

```
┌─────────────────────────────────────────────────────┐
│  Header: Test Smell Selector                       │
├─────────────────────────────────────────────────────┤
│  Filters: [Repo ▼] [Type ▼] [Tool ▼] [Status ▼]   │
├──────────────────────┬──────────────────────────────┤
│ Smell List (35%)     │  Smell Detail (65%)          │
│                      │                              │
│ □ Assertion Roulette │  Repository: redux-offline   │
│   config.test.js:44  │  File: src/__tests__/...     │
│   High · Steel       │  Lines: 44-46                │
│                      │                              │
│ ☑ Eager Test         │  Code Preview:               │
│   store.test.js:89   │  ┌────────────────────────┐ │
│   Medium · Steel     │  │ 44 | expect(cfg)...    │ │
│   📝 Has notes       │  │ 45 | expect(cfg)...    │ │
│                      │  │ 46 | expect(cfg)...    │ │
│ □ Mystery Guest      │  └────────────────────────┘ │
│   api.test.js:120    │                              │
│                      │  Notes: [Text area...]       │
│                      │  [✓ Select for Study]        │
└──────────────────────┴──────────────────────────────┘
```

### Cores

- **Selected Smell**: Azul (#3b82f6)
- **High Severity**: Vermelho (#ef4444)
- **Medium Severity**: Amarelo (#f59e0b)
- **Low Severity**: Azul (#3b82f6)
- **Highlighted Lines**: Amarelo claro (#fef3c7)

## 🛠️ Desenvolvimento

### Adicionar Novo Componente

```bash
cd smell-selector-ui/frontend/src/components
mkdir MyComponent
touch MyComponent/MyComponent.jsx
touch MyComponent/MyComponent.module.css
```

### Modificar Filtros

Edite `FilterBar.jsx` para adicionar novos filtros.

### Adicionar Novo Endpoint

1. Adicione modelo em `backend/models.py`
2. Adicione rota em `backend/main.py`
3. Adicione função em `frontend/src/api/client.js`

### Testar API Diretamente

```bash
# Listar repositórios
curl http://localhost:8001/api/repositories

# Listar smells
curl "http://localhost:8001/api/smells?repo=redux-offline"

# Selecionar smell
curl -X POST http://localhost:8001/api/smells/1/select \
  -H "Content-Type: application/json" \
  -d '{"annotations": "Test smell", "priority": 4}'
```

## 📊 Preparação para Análise de Refatorações

O sistema está preparado para armazenar múltiplas refatorações:

```sql
-- Exemplo: Mesmo smell, múltiplas estratégias
INSERT INTO experiments (study_smell_id, ai_tool, prompting_approach, ...)
VALUES
  (1, 'Claude', 'zero-shot', ...),
  (1, 'Claude', 'chain-of-thought', ...),
  (1, 'GPT-4', 'zero-shot', ...),
  (1, 'GPT-4', 'few-shot', ...);
```

Todos vinculados ao mesmo `study_smell_id`, permitindo comparação:
- Qual estratégia teve melhor taxa de sucesso?
- Qual LLM removeu mais smells?
- Quais introduziram novos smells?
- Impacto em métricas de código (complexidade, etc)

## 🔧 Troubleshooting

### Backend não inicia

```bash
# Verifique se o banco existe
ls -la ../../research_data/research.db

# Aplique migração novamente
cd backend && python migrate_database.py
```

### Erro: "ON CONFLICT clause does not match any PRIMARY KEY or UNIQUE constraint"

Este erro ocorre quando o banco de dados foi criado antes da correção do schema. **Solução**:

```bash
# Opção 1: Recriar o banco (PERDE DADOS!)
cd ../llm-refactor-pipeline
python -m llm_refactor
llm-refactor> db
# Selecione "Recreate database from scratch"

# Opção 2: Migração manual (PRESERVA DADOS)
sqlite3 ../../research_data/research.db
> CREATE UNIQUE INDEX IF NOT EXISTS uq_ui_metadata_smell
  ON smell_ui_metadata(detected_smell_id);
> .quit
```

**Causa**: A tabela `smell_ui_metadata` precisa de um constraint UNIQUE em `detected_smell_id` para que as operações de upsert (ON CONFLICT) funcionem corretamente.

**Prevenção**: Sempre use a versão mais recente do código ao criar novos bancos de dados. O schema correto está em `llm-refactor-pipeline/src/llm_refactor/modules/database/models.py`.

### Frontend não conecta à API

- Verifique se backend está rodando em http://localhost:8001
- Verifique console do navegador para erros de CORS
- Verifique `vite.config.js` proxy configuration

### Smells não aparecem

```bash
# Verifique se há smells no banco
sqlite3 ../../research_data/research.db "SELECT COUNT(*) FROM detected_smells;"

# Se não há smells, rode detecção
cd ../../llm-refactor-pipeline
python -m llm_refactor
llm-refactor> /analyze-smells redux-offline
```

## 📝 Próximos Passos

- [ ] Implementar CodeViewer com Prism.js (syntax highlighting)
- [ ] Adicionar diff view (antes/depois refatoração)
- [ ] Batch operations (selecionar múltiplos)
- [ ] Export para CSV
- [ ] Integração com pipeline de refatoração
- [ ] Dashboard de experimentos
- [ ] Gráficos e visualizações

## 🤝 Contribuindo

Este é um projeto de pesquisa acadêmica. Para contribuir:

1. Faça fork do repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Projeto de pesquisa - Uso interno acadêmico
