# Two-Phase Experiments Guide

## Visão Geral

O sistema de experimentos agora suporta **execução em duas fases**, otimizado para APIs de LLM com cobrança por tempo de uso (em vez de cobran ça por requisição).

### Arquitetura Antiga (Cobrança por Requisição)
```
Para cada smell:
  → Refatorar (chamada LLM)
  → Backup → Aplicar → Testar → Detectar → Restaurar → Salvar
```

### Nova Arquitetura (Cobrança por Tempo)
```
FASE 1 - Refatoração (batch de todas as chamadas LLM):
  Para cada smell:
    → Refatorar (chamada LLM)
    → Salvar código refatorado
    → Criar registro do experimento
    → NÃO modifica arquivos do repositório

FASE 2 - Execução (processar resultados):
  Para cada experimento refatorado:
    → Carregar código refatorado
    → Backup → Aplicar → Testar → Detectar → Restaurar → Salvar resultados
```

---

## Comandos Principais

### Modo Tradicional (Backward Compatible)

```bash
# Executa tudo em uma fase (como antes)
execute_experiment 42 3 1                    # Experimento individual
batch_experiments 3 1 --limit 10             # Batch tradicional
```

### Modo Duas Fases - Experimentos Individuais

```bash
# Fase 1: Apenas refatorar (não executa testes)
execute_experiment 42 3 1 --phase refactor

# Fase 2: Executar testes em experimento específico
execute_experiment --experiment-id 123 --phase execute

# Ou buscar por smell+strategy+model
execute_experiment 42 3 1 --phase execute

# Listar experimentos prontos para execução
execute_experiment list-pending
```

### Modo Duas Fases - Batch

```bash
# Fase 1: Refatorar TODOS os smells (batch de chamadas LLM)
batch_experiments 3 1 --phase refactor

# Fase 2: Executar TODOS os experimentos refatorados
batch_experiments 3 1 --phase execute

# Com manifest específico
batch_experiments 3 1 --phase refactor --limit 20
batch_experiments 3 1 --phase execute --manifest batch_summaries/refactor_manifest_s3_m1_20260219_143022.json

# Mostrar experimentos pendentes
batch_experiments 3 1 --show-pending

# Mostrar experimentos que falharam
batch_experiments 3 1 --show-failed
```

---

## Casos de Uso Práticos

### Caso 1: Otimizar Custos com LLM de Cobrança por Tempo

**Problema**: API cobra por minutos de uso, não por requisição.

**Solução**: Fazer todas as refatorações primeiro (maximiza uso do tempo pago).

```bash
# 1. Refatorar 100 smells em batch (todas as chamadas LLM juntas)
batch_experiments 3 1 --phase refactor

# Resultado: 100 códigos refatorados salvos, 100 experimentos criados
# Tempo: ~30 minutos (chamadas LLM)
# Custo: 1 janela de cobrança

# 2. Executar testes depois (sem chamadas LLM adicionais)
batch_experiments 3 1 --phase execute

# Resultado: Todos os 100 experimentos testados e salvos
# Tempo: ~2 horas (execução de testes)
# Custo: Apenas infraestrutura local
```

### Caso 2: Corrigir Experimentos que Falharam

**Problema**: 5 experimentos falharam durante a fase de execução.

**Solução**: Re-executar apenas a fase 2 dos experimentos falhados.

```bash
# 1. Ver quais falharam
batch_experiments 3 1 --show-failed

# 2. Re-executar fase 2 (não refatora novamente)
batch_experiments 3 1 --phase execute

# Alternativamente, corrigir um por vez
execute_experiment --experiment-id 456 --phase execute
```

### Caso 3: Revisão Manual de Código Refatorado

**Problema**: Quer revisar o código refatorado antes de executar testes.

**Solução**: Refatorar primeiro, revisar, depois executar.

```bash
# 1. Refatorar
execute_experiment 42 3 1 --phase refactor

# 2. Revisar manualmente
cat dataset/cot/qwen-2.5-coder-32b/smell_42/refactored_code.js

# 3. Se OK, executar testes
execute_experiment --experiment-id 123 --phase execute

# 4. Se não OK, deletar experimento e refatorar novamente com outra estratégia
```

### Caso 4: Processar em Lotes Pequenos

**Problema**: Repositório com muitos smells, quer processar em janelas.

**Solução**: Usar --limit e --start-from.

```bash
# Janela 1: Smells 1-50
batch_experiments 3 1 --phase refactor --limit 50
batch_experiments 3 1 --phase execute --limit 50

# Janela 2: Smells 51-100
batch_experiments 3 1 --phase refactor --start-from 51 --limit 50
batch_experiments 3 1 --phase execute --start-from 51 --limit 50
```

---

## Estrutura de Arquivos

### Manifest de Refatoração

Salvo em: `batch_summaries/refactor_manifest_s{strategy}_m{model}_{timestamp}.json`

```json
{
  "metadata": {
    "strategy_id": 3,
    "model_id": 1,
    "strategy_name": "Chain-of-Thought",
    "model_name": "Qwen 2.5 Coder 32B",
    "total": 100,
    "refactored": 98,
    "failed": 2,
    "timestamp": "2026-02-19T14:30:22"
  },
  "experiments": [
    {
      "experiment_id": 601,
      "smell_id": 1,
      "repo": "dayjs",
      "file_path": "test/parse.spec.js",
      "smell_type": "Assertion Roulette",
      "status": "refactored"
    }
  ]
}
```

### Código Refatorado

Salvo em: `dataset/{strategy}/{model}/smell_{id}/refactored_code.js`

Exemplo: `dataset/cot/qwen-2.5-coder-32b/smell_42/refactored_code.js`

---

## Banco de Dados

### Novas Colunas na Tabela `experiments`

- `refactor_phase_completed` (BOOLEAN): TRUE se Fase 1 completa
- `execution_phase_completed` (BOOLEAN): TRUE se Fase 2 completa

### Estados Possíveis

| Refactor | Execution | Significado |
|----------|-----------|-------------|
| FALSE    | FALSE     | Não iniciado ou falhou na refatoração |
| TRUE     | FALSE     | Refatorado, aguardando execução |
| TRUE     | TRUE      | Completo (ambas as fases) |
| FALSE    | TRUE      | Impossível (não pode executar sem refatorar) |

### Queries Úteis

```sql
-- Experimentos prontos para executar (Fase 1 OK, Fase 2 pendente)
SELECT * FROM experiments 
WHERE refactor_phase_completed = TRUE 
AND execution_phase_completed = FALSE;

-- Experimentos completos
SELECT * FROM experiments 
WHERE refactor_phase_completed = TRUE 
AND execution_phase_completed = TRUE;

-- Experimentos que falharam
SELECT * FROM experiments 
WHERE refactor_phase_completed = FALSE 
OR (refactor_phase_completed = TRUE AND execution_phase_completed = FALSE);
```

---

## Novos Métodos CRUD

Em `llm_refactor/modules/database/crud.py`:

```python
# Buscar experimento com todos os relacionamentos
get_experiment_with_relations(session, experiment_id)

# Encontrar experimento por smell+strategy+model
find_experiment_by_smell_strategy_model(session, smell_id, strategy, model)

# Listar experimentos refatorados mas não executados
get_refactored_pending_execution(session, strategy=None, model=None)

# Listar experimentos que falharam
get_failed_experiments(session, strategy=None, model=None)
```

---

## Migrando Experimentos Existentes

Os 600 experimentos existentes foram automaticamente migrados com:
- `refactor_phase_completed = TRUE`
- `execution_phase_completed = TRUE`

Isso preserva a compatibilidade com análises anteriores.

---

## Testes e Validação

### Testar Fase 1 (Refatoração)

```bash
# Dry run primeiro
batch_experiments 3 1 --phase refactor --limit 5 --dry-run

# Executar com verbose
batch_experiments 3 1 --phase refactor --limit 5 --verbose

# Verificar arquivos criados
ls -la dataset/cot/qwen-2.5-coder-32b/smell_*/refactored_code.js

# Verificar manifest
cat batch_summaries/refactor_manifest_s3_m1_*.json
```

### Testar Fase 2 (Execução)

```bash
# Ver pendentes primeiro
batch_experiments 3 1 --show-pending

# Dry run
batch_experiments 3 1 --phase execute --limit 3 --dry-run

# Executar com verbose
batch_experiments 3 1 --phase execute --limit 3 --verbose
```

---

## Troubleshooting

### Problema: "No experiments pending execution"

**Causa**: Todos os experimentos já foram executados ou não há experimentos refatorados.

**Solução**:
```bash
# Verificar se há experimentos refatorados
batch_experiments 3 1 --show-pending

# Se não há, executar fase de refatoração primeiro
batch_experiments 3 1 --phase refactor --limit 10
```

### Problema: "Experiment has no refactored code"

**Causa**: Experimento foi criado mas fase 1 falhou.

**Solução**:
```bash
# Deletar experimento com falha e refatorar novamente
# (via CLI database delete ou SQL direto)

# Ou forçar re-refatoração
batch_experiments 3 1 --phase refactor --force
```

### Problema: Arquivo não restaurado após falha

**Causa**: Processo interrompido durante Fase 2.

**Solução**:
```bash
# O backup ainda existe, restaurar manualmente
cd llm-refactor-pipeline
backup restore <repo_name> <file_path>
```

---

## Performance e Otimização

### Estimativas de Tempo

**Fase 1 (Refatoração)**:
- LLM call: ~5-15s por smell
- 100 smells: ~15-30 minutos
- Pode ser paralelizado (futuro)

**Fase 2 (Execução)**:
- Por experimento: ~30-120s (depende dos testes do repositório)
- 100 experimentos: ~1-3 horas
- DEVE ser sequencial (um repositório por vez)

### Custos com LLM de Cobrança por Tempo

**Cenário**: 100 smells, API cobra $0.50/hora

**Modo Antigo** (uma fase):
- Chamadas LLM intercaladas com testes
- Tempo total: 5 horas
- Custo: $2.50

**Modo Novo** (duas fases):
- Fase 1: 30 minutos de chamadas LLM
- Fase 2: 2 horas sem chamadas LLM
- Custo: $0.25 (83% de economia!)

---

## Próximos Passos

1. ✅ Sistema implementado e testado
2. ✅ Migration executada (600 experimentos migrados)
3. 🔄 Documentação completa
4. ⏳ Testes com API real de cobrança por tempo
5. ⏳ Paralelização da Fase 1 (opcional, para ~10x speedup)

---

## Referências Rápidas

### Execute Experiment
```bash
execute_experiment <smell_id> <strategy> <model> [--phase {refactor|execute|all}] [--experiment-id <id>]
```

### Batch Experiments
```bash
batch_experiments <strategy> <model> [--phase {refactor|execute|all}] [options]
```

### Opções Comuns
- `--phase`: refactor, execute, ou all (padrão)
- `--limit N`: Processar no máximo N items
- `--start-from N`: Começar do ID N
- `--manifest FILE`: Usar manifest específico (Fase 2)
- `--verbose`: Mostrar output detalhado
- `--dry-run`: Preview sem executar
- `--show-pending`: Mostrar pendentes
- `--show-failed`: Mostrar falhados
- `--force`: Re-executar todos (Fase 1)
