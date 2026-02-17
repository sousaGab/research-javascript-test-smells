# Batch Experiments - Novo Comando CLI

## 🎉 Novo Comando Integrado ao CLI

O comando `batch_experiments` foi integrado ao CLI principal do `llm-refactor-pipeline`, eliminando problemas de imports e variáveis de ambiente.

## 🚀 Como Usar

### Iniciar o CLI
```bash
cd llm-refactor-pipeline
python -m llm_refactor
```

### Comandos Disponíveis

#### Ver ajuda
```
llm-refactor> batch_experiments help
```

#### Listar todos os smells do estudo
```
llm-refactor> batch_experiments list
```

#### Ver smells pendentes para uma estratégia/modelo
```
llm-refactor> batch_experiments 1 1 --list-pending
```

#### Fazer dry-run (testar sem executar)
```
llm-refactor> batch_experiments 1 1 --limit 5 --dry-run
```

#### Executar experimentos
```
llm-refactor> batch_experiments 1 1 --limit 5
```

## 📋 Sintaxe Completa

```
batch_experiments <strategy_id> <model_id> [options]
```

### Opções

- `--limit N` - Processar no máximo N smells
- `--start-from N` - Começar do smell ID N
- `--verbose` - Mostrar output detalhado
- `--dry-run` - Mostrar o que seria executado sem rodar
- `--no-skip` - Re-executar todos (não pula já executados)
- `--list-pending` - Listar smells pendentes

## 💡 Exemplos Práticos

### 1. Planejar execução
```
llm-refactor> batch_experiments 1 1 --list-pending
# Ver quantos smells estão pendentes

llm-refactor> batch_experiments 1 1 --limit 10 --dry-run
# Ver quais seriam os próximos 10 a executar
```

### 2. Testar com poucos smells
```
llm-refactor> batch_experiments 1 1 --limit 3
# Executar apenas 3 para validar
```

### 3. Executar em lote
```
llm-refactor> batch_experiments 1 1
# Executar todos os pendentes
```

### 4. Retomar execução interrompida
```
llm-refactor> batch_experiments 1 1 --start-from 50
# Continuar do smell 50
```

### 5. Debug com verbose
```
llm-refactor> batch_experiments 1 1 --limit 1 --verbose
# Ver output completo de 1 experimento
```

## ✅ Vantagens desta Abordagem

1. **Sem problemas de import** - Usa a infraestrutura do CLI
2. **Variáveis de ambiente carregadas** - `.env` é lido automaticamente
3. **Integrado ao help** - Aparece em `help`
4. **Mesmo ambiente** - Todos os módulos disponíveis
5. **Autocompletar** - Nome do comando é sugerido automaticamente

## 🔄 Comparação com Script Antigo

### Antes (script separado)
```bash
python run_batch_experiments.py --strategy 1 --model 1 --limit 5
# ❌ Problemas de import
# ❌ Precisa configurar PYTHONPATH
# ❌ Variáveis de ambiente não carregadas
```

### Agora (comando CLI)
```bash
python -m llm_refactor
llm-refactor> batch_experiments 1 1 --limit 5
# ✅ Imports funcionam
# ✅ Ambiente configurado
# ✅ Integrado ao sistema
```

## 📊 Workflow Recomendado

```
# 1. Iniciar CLI
python -m llm_refactor

# 2. Ver estratégias e modelos disponíveis
llm-refactor> refactor strategies
llm-refactor> refactor models

# 3. Ver smells pendentes
llm-refactor> batch_experiments 1 1 --list-pending

# 4. Testar com dry-run
llm-refactor> batch_experiments 1 1 --limit 5 --dry-run

# 5. Executar poucos para validar
llm-refactor> batch_experiments 1 1 --limit 5

# 6. Se tudo OK, executar todos
llm-refactor> batch_experiments 1 1

# 7. Sair
llm-refactor> exit
```

## 🎯 Estratégias e Modelos

### Estratégias
- `1` - Zero-Shot
- `2` - Few-Shot  
- `3` - Chain-of-Thought

### Modelos
Use `refactor models` para ver todos disponíveis.

## ⚡ Atalhos

### Listar tudo
```bash
# Ver comandos disponíveis
help

# Ver smells
batch_experiments list

# Ver estratégias
refactor strategies

# Ver modelos
refactor models
```

### Execução rápida
```bash
# Top 5 smells com Qwen 2.5 Coder (modelo 1) e Zero-Shot (estratégia 1)
batch_experiments 1 1 --limit 5
```

## 🐛 Troubleshooting

### Erro de import
✅ **Resolvido** - O comando CLI já tem todos os imports configurados

### Variáveis de ambiente
✅ **Resolvido** - `.env` é carregado automaticamente pelo `__main__.py`

### Paths incorretos
✅ **Resolvido** - Usa `Config` do projeto que já tem todos os paths corretos

## 📝 Notas

- O comando por padrão **pula smells já executados** para a combinação strategy/model
- Use `--no-skip` para re-executar todos
- `Ctrl+C` durante execução salva o progresso
- Falhas individuais são logadas e não param a execução
- Após 3 falhas consecutivas, pede confirmação para continuar
