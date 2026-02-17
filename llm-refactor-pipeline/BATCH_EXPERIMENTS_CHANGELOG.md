# Batch Experiments - Changelog

## Versão 1.1 - 2026-02-17

### ✅ Correções

1. **Import Error Fixed**
   - Problema: `ModuleNotFoundError: No module named 'llm_refactor.modules.refactor.prompt_strategies'`
   - Solução: Corrigido imports para usar `llm_refactor.modules.refactor.hf_client`
   - Afetado: `PromptStrategy` e `HuggingFaceModels`

2. **Execute Method Signature Fixed**
   - Problema: `execute() got an unexpected keyword argument 'smell_id'`
   - Solução: Corrigido chamada de `execute(smell_id=x, ...)` para `execute("x y z")`
   - Detalhes: O método `execute()` espera string com argumentos separados por espaço

3. **Database Session Fixed**
   - Problema: `'generator' object does not support the context manager protocol`
   - Solução: Mudado de `with db.session_scope()` para `db.get_session()` + `try/finally`
   - Afetado: `get_study_smells()` e `get_pending_smells()`

### 🚀 Melhorias

1. **Verbose Mode**
   - Flag: `--verbose` ou `-v`
   - Mostra output completo de cada experimento
   - Útil para debugging

2. **Dry Run Mode**
   - Flag: `--dry-run`
   - Mostra quais smells seriam processados sem executar
   - Útil para planejar execuções

3. **Better Error Messages**
   - Extrai mensagens de erro específicas do output
   - Mostra linha exata do erro
   - Trunca mensagens longas (100 chars)

4. **Improved Progress Display**
   - Mostra mensagem de erro específica para cada falha
   - Contador de falhas mais visível
   - Melhor formatação do summary final

## Uso

### Comando Básico (corrigido)
```bash
python run_batch_experiments.py --strategy 1 --model 1 --limit 5
```

### Testar sem executar
```bash
python run_batch_experiments.py --strategy 1 --model 1 --limit 5 --dry-run
```

### Ver output detalhado
```bash
python run_batch_experiments.py --strategy 1 --model 1 --limit 5 --verbose
```

## Status

✅ **Funcionando Corretamente**
- ✅ Imports resolvidos
- ✅ Chamada do método execute() corrigida
- ✅ Database sessions corrigidas
- ✅ Dry-run implementado
- ✅ Verbose mode implementado
- ✅ Error handling melhorado

⚠️ **Nota sobre Execução**
- A falha na refatoração (quando acontece) geralmente é por:
  - Falta de API token configurado
  - Problemas de rede com a API
  - Modelo indisponível
  - Isso é **esperado** e não indica problema no script

## Próximos Passos

1. Configure o token da API da Hugging Face
2. Teste com `--limit 1` primeiro
3. Use `--dry-run` para planejar grandes execuções
4. Use `--verbose` para debugar problemas
5. Execute em lote com `--limit` aumentando gradualmente
