# Fix: Test Results Dashboard Showing "—/—"

## 📊 Problema Identificado

No frontend do smell-selector-ui, as métricas de testes estavam aparecendo como "—/—":

```
Metric                  Before    After     Delta
Tests passing           —         —/—       —
Test suites passing     —         —/—       —
```

## 🔍 Causa Raiz

### Dados Existiam mas Não Eram Salvos

1. **Arquivos test_summary.txt criados corretamente**
   - Localização: `llm-refactor-pipeline/dataset/.../smell_X/test_summary.txt`
   - Conteúdo completo com dados de testes e coverage
   - Exemplo:
     ```
     Test Suites: 70 passed, 70 total
     Tests:       7 skipped, 455 passed, 462 total
     Coverage:
       Statements: 92.93%
       Branches: 84.28%
     ```

2. **Funções de parsing existentes mas não utilizadas**
   - `parse_test_counts_from_summary()` - já implementada
   - `parse_coverage_from_summary()` - já implementada
   - Mas não eram chamadas ao salvar no banco

3. **Banco de dados recebia apenas boolean**
   ```python
   # ANTES (código antigo):
   create_test_results(
       session=session,
       experiment_id=experiment_id,
       phase='after',
       all_tests_passed=tests_passed  # ❌ Somente este campo!
   )
   ```

4. **Resultado: Campos NULL no banco**
   ```
   ID  Exp   Phase   Suites    Tests     All Pass
   1   1433  after   —/—       —/—       1
   2   1435  after   —/—       —/—       1
   ```

## ✅ Solução Implementada

### Modificações em `execute_experiment.py`

**Arquivo:** `llm-refactor-pipeline/src/llm_refactor/modules/execute_experiment/execute_experiment.py`

#### 1. Adicionados imports das funções de parsing

```python
from llm_refactor.modules.smell_analysis.test_analyzer import (
    parse_coverage_from_summary,
    parse_test_counts_from_summary,
    load_test_summary
)
```

#### 2. Modificado `_update_experiment_results()`

**Antes:**
- Assinatura: `(session, experiment_id, test_results, smell_detection_success)`
- Salvava apenas: `all_tests_passed`

**Depois:**
- Assinatura: `(session, experiment_id, test_results, smell_detection_success, output_dir)`
- Parseia `test_summary.txt`
- Salva todos os campos:
  - `test_suites_passed`, `test_suites_failed`, `test_suites_total`
  - `tests_passed`, `tests_failed`, `tests_total`
  - `coverage_statements`, `coverage_branches`, `coverage_functions`, `coverage_lines`
  - `all_tests_passed`

#### 3. Atualizadas as chamadas da função

Ambas as chamadas de `_update_experiment_results()` foram atualizadas para passar `output_dir`:
- Linha ~412 (single-phase mode)
- Linha ~767 (two-phase execution mode)

## 🧪 Verificação

### Script de Teste

Criado `test_parsing_fix.py` que verifica:
- ✅ Parsing de test_summary.txt funciona
- ✅ Todos os campos são extraídos corretamente
- ✅ Dados prontos para salvar no banco

### Resultado do Teste

```
✅ TEST PASSED: Parsing works correctly!

Data that would be saved to test_results table:
  test_suites_passed: 70
  test_suites_total: 70
  tests_passed: 455
  tests_total: 462
  coverage_statements: 92.93
  coverage_branches: 84.28
  coverage_functions: 86.14
  coverage_lines: 92.87
```

## 📦 Aplicação Automática ao Batch

A correção se aplica automaticamente aos experimentos em lote porque:

1. `batch_experiments.py` chama `ExecuteExperimentModule.execute()`
2. Que usa o mesmo código de `execute_experiment.py`
3. Não foram necessárias modificações separadas no batch_executor

## 💾 Banco de Dados

### Estado Atual
- Tabela `test_results` existe e está correta
- Apenas 2 registros com dados incompletos (fase anterior à correção)
- Novos experimentos salvarão dados completos

### Estrutura da Tabela
```sql
CREATE TABLE test_results (
    id INTEGER PRIMARY KEY,
    experiment_id INTEGER,
    phase TEXT,  -- 'before' or 'after'
    test_suites_passed INTEGER,
    test_suites_failed INTEGER,
    test_suites_total INTEGER,
    tests_passed INTEGER,
    tests_failed INTEGER,
    tests_total INTEGER,
    coverage_statements REAL,
    coverage_branches REAL,
    coverage_functions REAL,
    coverage_lines REAL,
    all_tests_passed BOOLEAN,
    ...
)
```

## 🎯 Próximos Passos

### Para Aplicar a Correção

1. **Novos experimentos** já usarão o código corrigido automaticamente
2. **Experimentos existentes** podem ser re-executados:
   ```bash
   execute_experiment --experiment-id <id> --phase execute
   ```

### Melhoria Futura (Opcional)

Atualmente apenas a fase "after" é salva no banco. Poderia-se também:

1. Salvar dados baseline (fase "before") de `tests_output/*/test_summary.txt`
2. Benefícios:
   - Dados históricos completos no banco
   - Frontend poderia mostrar coluna "Before" corretamente
   - Análises mais ricas sem depender de arquivos

3. Implementação sugerida:
   - Criar script de migração para popular dados baseline
   - Modificar `_analyze_test_results()` para também salvar fase "before"

## 📝 Resumo

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **test_summary.txt** | ✅ Criado | ✅ Criado |
| **Parsing** | ❌ Não usado | ✅ Usado |
| **Banco - Tests** | ❌ NULL | ✅ Valores corretos |
| **Banco - Coverage** | ❌ NULL | ✅ Valores corretos |
| **Frontend** | ❌ —/— | ✅ 455/462 |

---

**Data:** 20/02/2026  
**Arquivo Modificado:** `llm-refactor-pipeline/src/llm_refactor/modules/execute_experiment/execute_experiment.py`  
**Linhas Modificadas:** ~47, ~412, ~767, ~1439-1507
