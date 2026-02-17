# Batch Experiments - Guia Rápido de Uso

## ✅ Problema Resolvido!

O comando `batch_experiments` agora **executa os experimentos de verdade** quando você usa `--limit` ou sem `--dry-run`.

## 🚀 Uso Básico

### 1. Iniciar o CLI
```bash
cd llm-refactor-pipeline
python -m llm_refactor
```

### 2. Executar Comandos

#### Ver ajuda
```
llm-refactor> batch_experiments help
```

#### Listar smells
```
llm-refactor> batch_experiments list
```

#### Dry-run (testar sem executar)
```
llm-refactor> batch_experiments 1 1 --limit 5 --dry-run
```

#### **EXECUTAR DE VERDADE** (novo comportamento)
```
llm-refactor> batch_experiments 1 1 --limit 5
```

Isso agora vai realmente:
1. ✅ Executar os 5 experimentos
2. ✅ Mostrar progresso em tempo real
3. ✅ Exibir sucesso/falha de cada um
4. ✅ Mostrar resumo final

## 📊 Output Esperado

```
================================================================================
🚀 BATCH EXPERIMENT RUNNER
================================================================================
Strategy: Zero-Shot (ID: 1)
Model:    Qwen 2.5 Coder 32B (ID: 1)
Start Time: 2026-02-17 18:04:47
================================================================================

📊 Mode: Skip already executed (pending only)
🔍 Filter: Limited to 1 experiments

📋 Total to process: 1

================================================================================
🔄 STARTING EXPERIMENTS
================================================================================

────────────────────────────────────────────────────────────────────────────────
[1/1] Processing Smell ID: 1
  Repository: falcor
  File: /test/falcor/deref/deref.errors.spec.js
  Smell: Duplicate Assert
────────────────────────────────────────────────────────────────────────────────

🔍 [1/7] Fetching smell data from database...
📁 [2/7] Setting up output directories...
🤖 [3/7] Refactoring code with LLM...

✅ Success (1/1)  ou  ❌ Failed: <erro>

📊 Progress: 1/1 (100.0%)
⏱️  Elapsed: 2.5m | Est. remaining: 0.0m

================================================================================
📊 BATCH EXECUTION SUMMARY
================================================================================
Strategy:  Zero-Shot
Model:     Qwen 2.5 Coder 32B
Total:     1
✅ Success: 1
❌ Failed:  0
⏱️  Time:    2.5 minutes
⚡ Avg:     150.0s per experiment
================================================================================
```

## ⚠️ Configuração Necessária

### API Token da Hugging Face

Para que os experimentos funcionem, você precisa configurar o token:

1. **Criar arquivo `.env`** no diretório `llm-refactor-pipeline/`:
```bash
HF_TOKEN=seu_token_aqui
```

2. **Ou exportar variável de ambiente:**
```bash
export HF_TOKEN=seu_token_aqui
```

3. **Obter token:**
   - Acesse: https://huggingface.co/settings/tokens
   - Crie um token com permissão de leitura
   - Copie e cole no `.env`

## 🎯 Exemplos Práticos

### Teste com 1 smell
```
llm-refactor> batch_experiments 1 1 --limit 1
```

### Executar 5 smells
```
llm-refactor> batch_experiments 1 1 --limit 5
```

### Executar todos pendentes
```
llm-refactor> batch_experiments 1 1
```

### Com output verbose
```
llm-refactor> batch_experiments 1 1 --limit 1 --verbose
```

### Retomar do smell 50
```
llm-refactor> batch_experiments 1 1 --start-from 50
```

## 🔍 Diferença: Dry-run vs Execução Real

### Com `--dry-run` (não executa)
```
llm-refactor> batch_experiments 1 1 --limit 5 --dry-run

🔍 DRY RUN MODE - No experiments will be executed

Smells that would be processed:
  1. Smell 1: falcor//test/...
  2. Smell 3: falcor//test/...
  ...
  
✅ Dry run complete
```

### Sem `--dry-run` (executa de verdade)
```
llm-refactor> batch_experiments 1 1 --limit 5

🔄 STARTING EXPERIMENTS

[1/5] Processing Smell ID: 1
  Repository: falcor
  ...
  
✅ Success (1/5)

[2/5] Processing Smell ID: 3
  ...
```

## ⚡ Interrupção

Pressione `Ctrl+C` durante a execução para interromper:

```
⚠️  Interrupted by user!
Processed: 3/5
Completed: 2
Failed: 1
```

O progresso é salvo no banco de dados automaticamente.

## 📊 Monitoramento

Durante a execução, você verá:

- ✅ **Progresso**: Quantos foram processados
- ⏱️ **Tempo**: Elapsed e estimativa de quanto falta
- 📊 **Taxa**: Quantos sucesso vs falha
- 🔍 **Detalhes**: Cada experimento mostra os passos

## 🐛 Troubleshooting

### Erro: "HuggingFace API token not found"
**Solução**: Configure `HF_TOKEN` no `.env` ou variável de ambiente

### Erro: "No smells to process"
**Solução**: Todos os smells já foram executados para essa strategy/model. Use `--no-skip` ou `--list-pending`

### Nenhum output visível
**Solução**: Certifique-se de NÃO usar `--dry-run` se quer executar de verdade

## ✅ Status

- ✅ Execução real implementada
- ✅ Progresso em tempo real
- ✅ Interrupção com Ctrl+C
- ✅ Resumo final com estatísticas
- ✅ Erros são capturados e logados
- ✅ Funciona integrado ao CLI

**O comando está 100% funcional!** 🎉
