# Batch Experiments Guide

Script para executar experimentos em lote para todos os smells do estudo.

## 📋 Pré-requisitos

1. Banco de dados inicializado (`research_data/research.db`)
2. Study smells carregados na tabela `study_smells`
3. Repositórios clonados em `/repositories/`
4. Baseline de smells e testes executados

## 🚀 Uso Básico

### Listar todos os smells do estudo
```bash
python run_batch_experiments.py --list-smells
```

### Listar smells pendentes para uma estratégia/modelo
```bash
python run_batch_experiments.py --list-pending --strategy 1 --model 1
```

### Executar todos os smells pendentes
```bash
python run_batch_experiments.py --strategy 1 --model 1
```

## 📊 Estratégias e Modelos

### Estratégias (--strategy)
Consulte `PromptStrategy.STRATEGIES` para IDs disponíveis:
- `1`: zero-shot
- `2`: few-shot
- `3`: chain-of-thought
- etc.

### Modelos (--model)
Consulte `HuggingFaceModels.MODELS` para IDs disponíveis:
- `1`: qwen-2.5-coder-32b
- `2`: deepseek-coder-v2
- `3`: claude-sonnet-4
- etc.

## ⚙️ Opções Avançadas

### Limitar número de experimentos
```bash
python run_batch_experiments.py --strategy 1 --model 1 --limit 10
```

### Começar a partir de um smell específico
```bash
python run_batch_experiments.py --strategy 1 --model 1 --start-from 50
```

### Re-executar todos (incluindo já executados)
```bash
python run_batch_experiments.py --strategy 1 --model 1 --no-skip
```

### Ver output detalhado (verbose)
```bash
python run_batch_experiments.py --strategy 1 --model 1 --verbose
```

### Testar sem executar (dry-run)
```bash
python run_batch_experiments.py --strategy 1 --model 1 --limit 10 --dry-run
```

### Combinar opções
```bash
# Executar 20 smells a partir do ID 100 com verbose
python run_batch_experiments.py --strategy 1 --model 1 --start-from 100 --limit 20 --verbose

# Ver o que seria executado sem rodar
python run_batch_experiments.py --strategy 1 --model 1 --dry-run
```

## 📈 Comportamento

### Modo Padrão (skip_executed=True)
- Verifica quais smells JÁ foram executados para a combinação strategy/model
- Executa apenas os **pendentes**
- Seguro para re-executar sem duplicar

### Modo No-Skip (--no-skip)
- Executa **todos** os smells
- **Cria experimentos duplicados** para mesma strategy/model
- Use apenas se quiser múltiplas execuções

## ⚡ Exemplo de Execução

```bash
$ python run_batch_experiments.py --strategy 1 --model 1

================================================================================
🚀 BATCH EXPERIMENT RUNNER
================================================================================
Strategy: zero-shot (ID: 1)
Model:    qwen-2.5-coder-32b (ID: 1)
Start Time: 2026-02-17 14:30:00
================================================================================

📊 Mode: Skip already executed (pending only)
📋 Total to process: 246

Proceed with 246 experiments? (yes/no): yes

================================================================================
🔄 STARTING EXPERIMENTS
================================================================================

────────────────────────────────────────────────────────────────────────────────
[1/246] Processing Smell ID: 1
  Repository: falcor
  File: /test/falcor/deref/deref.errors.spec.js
  Smell: Duplicate Assert
────────────────────────────────────────────────────────────────────────────────

🔍 [1/7] Fetching smell data from database...
   ✓ Loaded smell from falcor
   
... (experimento em execução) ...

✅ Success (1/246)

📊 Progress: 1/246 (0.4%)
⏱️  Elapsed: 2.5m | Est. remaining: 610.0m
```

## 🛑 Interrupção e Retomada

### Interromper com Ctrl+C
O script detecta interrupção e **salva o progresso**:
- Experimentos completados ficam no banco
- Próxima execução pula os já feitos (modo padrão)

### Retomar execução
```bash
# Executa apenas os pendentes automaticamente
python run_batch_experiments.py --strategy 1 --model 1
```

### Retomar de um ponto específico
```bash
# Se parou no smell 50, começar do 51
python run_batch_experiments.py --strategy 1 --model 1 --start-from 51
```

## 📊 Estatísticas Finais

```
================================================================================
📊 BATCH EXECUTION SUMMARY
================================================================================
Strategy:  zero-shot
Model:     qwen-2.5-coder-32b
Total:     246
✅ Success: 240
❌ Failed:  6
⏱️  Time:    615.3 minutes
⚡ Avg:     150.2s per experiment

❌ Failed Smells (6):
  • ID 45: inferno / /packages/inferno-test-utils/__tests__/render... - Timeout
  • ID 78: luxon / /test/duration/math.test.js... - Tests failed
  ...
================================================================================
```

## 🔍 Dicas

### Testar com poucos smells primeiro
```bash
# Testar com 5 smells antes de rodar todos
python run_batch_experiments.py --strategy 1 --model 1 --limit 5
```

### Ver quantos faltam
```bash
python run_batch_experiments.py --list-pending --strategy 1 --model 1
```

### Executar diferentes combinações
```bash
# Estratégia 1 com todos os modelos
python run_batch_experiments.py --strategy 1 --model 1
python run_batch_experiments.py --strategy 1 --model 2
python run_batch_experiments.py --strategy 1 --model 3

# Todos as estratégias com modelo 1
python run_batch_experiments.py --strategy 1 --model 1
python run_batch_experiments.py --strategy 2 --model 1
python run_batch_experiments.py --strategy 3 --model 1
```

## ⚠️ Avisos

1. **Tempo de execução**: ~2-3 minutos por smell × 246 smells = **~10 horas** por combinação
2. **Espaço em disco**: Cada experimento gera ~5-10MB de dados
3. **API Tokens**: Verifique limites de uso da API do modelo
4. **Recursos**: Mantenha o computador ligado e conectado

## 🐛 Troubleshooting

### "No smells to process"
- Todos já foram executados para esta strategy/model
- Use `--list-pending` para verificar

### "Multiple failures detected"
- Problema com repositórios ou testes
- Verifique logs individuais
- Use `--limit 1` para debugar

### "Database locked"
- Outro processo está usando o banco
- Feche smell-selector-ui se estiver rodando
- Aguarde alguns segundos e tente novamente

## 📁 Estrutura de Saída

```
llm-refactor-pipeline/
└── dataset/
    └── zero-shot/              # Strategy
        └── qwen-2.5-coder-32b/ # Model
            ├── smell_1/
            │   ├── original_code.js
            │   ├── refactored_code.js
            │   ├── smell_detection/
            │   │   └── smells.csv
            │   ├── analysis/
            │   │   ├── smell_analysis.json
            │   │   └── test_analysis.json
            │   ├── test_summary.txt
            │   └── test_output.txt
            ├── smell_2/
            ...
```

## 💾 Banco de Dados

Cada experimento atualiza:
- `experiments`: Novo registro com todos os detalhes
- Flags: `smell_removed`, `introduced_new_smells`, `tests_still_passing`, `coverage_changed`, `tests_changed`

