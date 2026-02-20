# Implementação de Análise de Testes

## Resumo

Este documento descreve a implementação da análise de resultados de testes no pipeline de refatoração, conforme solicitado. A análise compara os resultados de testes entre a versão baseline e a versão refatorada, respondendo às perguntas:

- **Teve mudança no coverage?** (`coverage_changed: bool`)
- **Teve mudança nas suites de teste?** (`tests_changed: bool`)

## Arquivos Criados/Modificados

### 1. Novos Arquivos

#### `src/llm_refactor/modules/smell_analysis/test_analyzer.py`
Módulo principal de análise de testes contendo:

- **`parse_coverage_from_summary()`**: Extrai percentuais de cobertura (statements, branches, functions, lines)
- **`parse_test_counts_from_summary()`**: Extrai contagens de testes (passed, failed, skipped, total)
- **`compare_coverage()`**: Compara cobertura entre baseline e refactored, retorna `changed: bool`
- **`compare_test_counts()`**: Compara contagens entre baseline e refactored, retorna `changed: bool`
- **`analyze_test_results()`**: Função principal que combina todas as análises

#### `add_test_analysis_columns.py`
Script de migração de banco de dados para adicionar as colunas:
- `coverage_changed` (Boolean)
- `tests_changed` (Boolean)

#### `tests/test_test_analyzer.py`
Suite completa de testes unitários para o módulo test_analyzer.

### 2. Arquivos Modificados

#### `src/llm_refactor/modules/smell_analysis/__init__.py`
- Adicionado export de `analyze_test_results` e funções auxiliares

#### `src/llm_refactor/modules/database/models.py`
- Adicionadas colunas `coverage_changed` e `tests_changed` na tabela `Experiment`

#### `src/llm_refactor/modules/smell_analysis/db_persister.py`
- Função `update_experiment_analysis_flags()` modificada para aceitar parâmetros `coverage_changed` e `tests_changed`

#### `src/llm_refactor/modules/execute_experiment/execute_experiment.py`
- Adicionado Step [7.5/8]: Análise de resultados de testes
- Criado método `_analyze_test_results()`
- Integração com pipeline principal

## Fluxo de Execução

### Step 7: Análise de Smells
1. Carrega baseline: `/smells_detected/{repo_name}/smells.csv`
2. Carrega refactored: `/dataset/{strategy}/{model}/smell_{id}/smell_detection/smells.csv`
3. Compara e identifica smells removidos/introduzidos
4. Salva JSON: `analysis/smell_analysis.json`
5. Atualiza flags: `smell_removed`, `introduced_new_smells`

### Step 7.5: Análise de Testes (NOVO)
1. Carrega baseline: `/tests_output/{repo_name}/test_summary.txt`
2. Carrega refactored: `/dataset/{strategy}/{model}/smell_{id}/test_summary.txt`
3. Parseia cobertura e contagens de testes
4. Compara valores (threshold de 0.01% para mudanças)
5. Salva JSON: `analysis/test_analysis.json`
6. Atualiza flags: `coverage_changed`, `tests_changed`

### Step 8: Restaura arquivo original

## Formato de Saída

### JSON de Análise de Testes (`test_analysis.json`)

```json
{
  "baseline_available": true,
  "refactored_available": true,
  "coverage_changed": true,
  "tests_changed": false,
  "coverage_comparison": {
    "changed": true,
    "improvements": ["statements", "lines"],
    "regressions": [],
    "details": {
      "statements": {"before": 92.93, "after": 93.50, "diff": 0.57},
      "branches": {"before": 84.28, "after": 84.28, "diff": 0.0},
      "functions": {"before": 86.14, "after": 86.14, "diff": 0.0},
      "lines": {"before": 92.87, "after": 93.00, "diff": 0.13}
    }
  },
  "tests_comparison": {
    "changed": false,
    "all_passed_before": true,
    "all_passed_after": true,
    "details": {
      "tests_passed": {"before": 455, "after": 455, "diff": 0},
      "tests_failed": {"before": 0, "after": 0, "diff": 0},
      "tests_total": {"before": 462, "after": 462, "diff": 0}
    }
  }
}
```

### Flags no Banco de Dados

Tabela `experiments`:
- **`coverage_changed`**: Boolean - Indica se houve mudança na cobertura de testes
- **`tests_changed`**: Boolean - Indica se houve mudança nos resultados de execução de testes

## Critérios de Detecção de Mudança

### Coverage Changed
- Threshold: 0.01% (evita ruído de flutuação mínima)
- Retorna `True` se qualquer métrica (statements, branches, functions, lines) mudou mais de 0.01%
- Retorna `False` caso contrário

### Tests Changed
- Retorna `True` se qualquer contagem mudou:
  - Número de testes passados
  - Número de testes falhados
  - Número de testes pulados
  - Número total de testes
- Retorna `False` se todas as contagens são idênticas

## Validação

### Testes com Dados Reais
Validado com:
- **falcor**: 70 test suites, 462 tests, 92.93% statements coverage
- **commander.js**: Comparação detectou mudanças corretamente
- **nock**, **luxon**: Validação adicional

### Cobertura de Testes
- ✅ Parsing de coverage
- ✅ Parsing de test counts
- ✅ Comparação de coverage (sem mudança, melhorias, regressões)
- ✅ Comparação de test counts (sem mudança, com falhas)
- ✅ Análise completa (arquivos existentes, faltantes, diferentes)

## Formato de Entrada Esperado

### test_summary.txt
```
=============================== Coverage summary ===============================
Statements   : 92.93% ( 2591/2788 )
Branches     : 84.28% ( 1132/1343 )
Functions    : 86.14% ( 230/267 )
Lines        : 92.87% ( 2568/2765 )
================================================================================

Test Suites: 70 passed, 70 total
Tests:       7 skipped, 455 passed, 462 total
Snapshots:   2 passed, 2 total
Time:        13.853 s
```

Também suporta suites/testes com falhas:
```
Test Suites: 2 failed, 68 passed, 70 total
Tests:       7 skipped, 3 failed, 452 passed, 462 total
```

## Saída no Console

Durante execução do experimento:

```
🧪 [7.5/8] Analyzing test results changes...
   ✓ Test analysis saved: dataset/zero_shot/claude-sonnet-4/smell_123/analysis/test_analysis.json
   ✓ Coverage changed: True
   ✓ Test counts changed: False
   → Coverage improvements: statements, lines
   ✓ Updated experiment test analysis flags in database
```

## Próximos Passos

### Se o banco de dados já existe:
```bash
cd llm-refactor-pipeline
python add_test_analysis_columns.py
```

### Executar experimento:
```bash
python -m llm_refactor.cli execute-experiment \
  --smell-id <ID> \
  --strategy <strategy> \
  --model <model>
```

### Verificar resultados:
- JSON: `dataset/<strategy>/<model>/smell_<id>/analysis/test_analysis.json`
- Database: Consultar `coverage_changed` e `tests_changed` na tabela `experiments`

## Integração com Análise de Smells

A análise de testes complementa a análise de smells existente:

| Análise | Baseline | Refactored | Flags no DB |
|---------|----------|------------|-------------|
| **Smells** | `smells_detected/{repo}/smells.csv` | `dataset/.../smell_detection/smells.csv` | `smell_removed`, `introduced_new_smells` |
| **Testes** | `tests_output/{repo}/test_summary.txt` | `dataset/.../test_summary.txt` | `coverage_changed`, `tests_changed` |

Ambas as análises ocorrem após a execução dos testes (Step 6) e antes da restauração do arquivo original (Step 8).

## Notas Importantes

1. **Não salva detalhes no banco**: Apenas flags booleanos são salvos, detalhes completos estão no JSON
2. **Baseline já existe**: Os arquivos `test_summary.txt` em `tests_output/` foram gerados previamente
3. **Threshold de mudança**: 0.01% para evitar falsos positivos de flutuação mínima
4. **Análise binária**: Retorna apenas sim/não, não quantifica magnitude (detalhes estão no JSON)

---

**Data de implementação**: 2026-02-17  
**Status**: ✅ Completo e testado
