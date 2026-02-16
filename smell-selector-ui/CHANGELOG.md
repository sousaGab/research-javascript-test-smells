# Changelog - Smell Selector UI

## [1.1.0] - 2026-01-30

### ✨ Novos Recursos

#### Backend API
- **Novo endpoint `/api/filter-options`**: Retorna opções de filtro dinâmicas do banco de dados
  - Lista de ferramentas de detecção (`SNUTSJS`, `Steel`)
  - Lista completa de tipos de smell com contagens
  - Marcação de smells primários de pesquisa
  - Descrições e guias de refatoração incluídos

- **Novo endpoint `/api/smell-catalog`**: Catálogo completo dos 10 smells primários de pesquisa
  - Descrições detalhadas
  - Guias de refatoração
  - Níveis de severidade
  - IDs estruturados

#### Módulo de Constantes
- **Arquivo `smell_constants.py`** adicionado ao backend
  - 10 Primary Research Smells definidos
  - 23 tipos de smells detectados catalogados
  - Funções utilitárias:
    - `normalize_smell_name()` - Normalização de variações
    - `get_smell_info()` - Obter descrição e guia
    - `is_primary_research_smell()` - Verificação de smell primário
  - Mapeamento de aliases e variações

### 🔧 Correções

#### Nomes de Ferramentas de Detecção
- **Antes**: `snuts`, `steel` (minúsculas, inconsistente)
- **Depois**: `SNUTSJS`, `Steel` (padronizado)
- ✓ Banco de dados atualizado (9,682 smells)
- ✓ Import automático com normalização
- ✓ Backend retorna nomes corretos

#### Sistema de Import
- Normalização automática de nomes de ferramentas durante importação
- Mapeamento: `snuts` → `SNUTSJS`, `steel` → `Steel`
- Validação de dados durante importação

### 📊 Dados Atualizados

#### Estatísticas do Banco de Dados
```
Total Smells: 9,682
├─ SNUTSJS: 1,711 smells (17.7%)
└─ Steel: 7,971 smells (82.3%)

Primary Research Smells: 6,049 (62.5%)
Unique Smell Types: 23
Repositories: 12
```

#### Top 5 Smells
1. **Duplicate Assert**: 2,392 (24.7%) ★
2. **Magic Number**: 1,940 (20.0%) ★
3. **Eager Test**: 1,055 (10.9%)
4. **Global Variable**: 935 (9.7%)
5. **Lazy Test**: 820 (8.5%) ★

★ = Primary Research Smell

### 📖 Documentação

#### API Atualizada
- Documentação completa em http://localhost:8001/docs
- README.md atualizado com novos endpoints
- Lista de smells primários documentada
- Ferramentas de detecção documentadas

#### Novos Comandos CLI
```bash
# Importar smells com normalização automática
llm-refactor> db import-smells

# Validar dados importados
llm-refactor> db validate-import
```

### 🏗️ Arquitetura

#### Novos Arquivos
```
smell-selector-ui/backend/
├── smell_constants.py          # Constantes de smells (NOVO)
└── main.py                     # Endpoints atualizados

llm-refactor-pipeline/src/llm_refactor/modules/
├── smell_constants.py          # Constantes compartilhadas (NOVO)
└── database/
    ├── cli_commands.py         # Import com normalização
    └── test_import.py          # Validação de imports (NOVO)
```

### 🔄 Breaking Changes

#### Nenhuma mudança quebra compatibilidade
- Frontend existente continua funcionando
- Novos endpoints são aditivos
- Dados antigos foram migrados automaticamente

### 🎯 Próximos Passos

**Sugestões para o Frontend**:
1. Consumir `/api/filter-options` para preencher dropdowns dinamicamente
2. Adicionar tooltip com descrições dos smells (usar `description` do endpoint)
3. Destacar visualmente Primary Research Smells (usar `is_primary`)
4. Adicionar página de catálogo (usar `/api/smell-catalog`)

**Exemplo de uso no React**:
```javascript
// Carregar opções de filtro
const { data } = await fetch('/api/filter-options').then(r => r.json());

// Preencher dropdown de ferramentas
<select>
  {data.detection_tools.map(tool =>
    <option key={tool} value={tool}>{tool}</option>
  )}
</select>

// Preencher dropdown de smells com badge para primários
<select>
  {data.smell_types.map(smell =>
    <option key={smell.name} value={smell.name}>
      {smell.is_primary && '★ '}{smell.name} ({smell.count})
    </option>
  )}
</select>
```

### 📝 Notas Técnicas

#### Normalização de Dados
- Todo import futuro aplicará automaticamente a normalização
- Banco de dados já corrigido para dados existentes
- Consistência garantida entre ferramentas

#### Validação
- Novo comando `db validate-import` verifica integridade
- Checks automáticos de:
  - Ferramentas de detecção válidas
  - Distribuição de tipos de smell
  - Integridade referencial
  - Dados faltantes

---

## [1.0.0] - 2026-01-29

### 🎉 Lançamento Inicial
- Interface web React + Vite
- Backend FastAPI
- Integração com research.db
- Sistema de seleção de smells
- Anotações e prioridades
- Filtros por repositório, tipo e ferramenta
