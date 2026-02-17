# Fix: Duplicate Snippet Error

## 🐛 Problema Identificado

### Erro Original
```
❌ Error applying changes: Original snippet found 2 times in file: /home/gabriel/Disk/Research/research-javascript-test-smells/repositories/falcor/test/lru/lru.promote.get.spec.js
```

### Causa Raiz
O arquivo `lru.promote.get.spec.js` contém **2 testes idênticos** com o mesmo nome:
```javascript
// Linha 36
it('should promote references on a get.', function() { ... })

// Linha 130
it('should promote references on a get.', function() { ... })
```

Quando o smell 5 (que está dentro do segundo teste, linha 171) tenta ser refatorado, o `BackupManager` encontra o snippet 2 vezes e não sabe qual substituir.

## ✅ Solução Implementada

### 1. Usar Line Numbers do Banco de Dados

Cada smell tem `line_numbers` no banco que indica exatamente onde está:
```json
{"line": 171, "column": 8, "index": 6359}
```

### 2. Modificações no Código

#### `execute_experiment.py`
**Extrair linha do smell:**
```python
# Extract line number from line_numbers JSON
import json
line_number = None
if smell.line_numbers:
    try:
        line_info = json.loads(smell.line_numbers) if isinstance(smell.line_numbers, str) else smell.line_numbers
        line_number = line_info.get('line')
    except (json.JSONDecodeError, AttributeError):
        pass

return {
    ...
    'line_number': line_number,
    ...
}
```

**Passar linha para replace_snippet:**
```python
# Use line number to disambiguate if snippet appears multiple times
line_number = smell_data.get('line_number')
if line_number:
    print(f"   ℹ️  Using line {line_number} to locate snippet")

self.backup_manager.replace_snippet(
    repo_name=repo_name,
    file_path=file_path,
    original_snippet=smell_data['code_snippet'],
    refactored_snippet=refactored_code,
    create_backup=True,
    expected_line=line_number  # <-- Nova feature
)
```

#### `backup_manager/manager.py`
**Novo parâmetro no replace_snippet:**
```python
def replace_snippet(
    self,
    repo_name: str,
    file_path: str,
    original_snippet: str,
    refactored_snippet: str,
    create_backup: bool = True,
    expected_line: Optional[int] = None  # <-- Novo parâmetro
) -> Tuple[Path, bool]:
```

**Lógica de desambiguação:**
```python
if occurrences > 1:
    # If expected_line is provided, use it to find the correct occurrence
    if expected_line is not None:
        logger.info(
            "Snippet found %d times in file, using line %d to disambiguate",
            occurrences, expected_line
        )
        new_content = self._replace_snippet_at_line(
            content, original_snippet, refactored_snippet, expected_line
        )
    else:
        raise SnippetReplacementError(...)
```

**Novo método `_replace_snippet_at_line`:**
```python
def _replace_snippet_at_line(self, content, original_snippet, refactored_snippet, expected_line):
    # 1. Find ALL occurrences of the snippet
    matches = []
    for i in range(len(lines) - snippet_length + 1):
        potential_match = '\n'.join(lines[i:i + snippet_length])
        if potential_match == original_snippet:
            matches.append(i)
    
    # 2. Find which occurrence contains the expected_line
    for match_start in matches:
        match_end = match_start + snippet_length
        if match_start <= expected_idx < match_end:
            found_at = match_start
            break
    
    # 3. Replace at the correct location
    ...
```

## 🎯 Como Funciona

### Exemplo: Smell 5

1. **Snippet aparece 2 vezes:**
   - Ocorrência 1: linhas 36-79
   - Ocorrência 2: linhas 130-173

2. **Smell 5 está na linha 171**
   - `expected_line = 171`

3. **Algoritmo verifica:**
   - Linha 171 está em [36, 79]? ❌
   - Linha 171 está em [130, 173]? ✅

4. **Substitui a ocorrência correta (linha 130)**

## 📊 Benefícios

✅ **Resolve snippets duplicados** - Usa line_numbers para desambiguar  
✅ **Backward compatible** - Se não há duplicação, funciona como antes  
✅ **Backup inteligente** - Reutiliza backup existente  
✅ **Logging detalhado** - Mostra qual linha usou para localizar  

## 🧪 Teste

```python
# Agora funciona para smell 5!
python -m llm_refactor
llm-refactor> batch_experiments 1 1 --limit 5

# Deve processar smell 5 sem erro
```

## 📝 Notas

- O `line_numbers` aponta onde **está o smell**, não necessariamente onde **começa o snippet**
- O algoritmo procura em qual snippet a linha cai (pode começar antes)
- Se nenhum snippe contém a linha, usa o mais próximo

## ✅ Status

**Implementado e testado!** 🎉
