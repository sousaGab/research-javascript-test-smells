# Como Rodar os Testes de Snippet Line Numbers

## Teste do Backend

Este teste verifica se o backend está corretamente retornando `snippet_start_line` e `snippet_end_line` na API.

### Pré-requisitos:

1. **Banco de dados migrado:**
   ```bash
   cd llm-refactor-pipeline
   python add_snippet_columns_migration.py
   ```

2. **Backend rodando:**
   ```bash
   cd smell-selector-ui/backend
   python -m uvicorn main:app --reload
   ```

   Deixe esse terminal aberto!

### Executar Teste:

Em outro terminal:

```bash
cd smell-selector-ui/backend
python test_snippet_lines_simple.py
```

### Resultado Esperado:

```
================================================================================
SNIPPET LINE NUMBERS - API TEST
================================================================================

Database: .../research_data/research.db
✅ Database found

Step 1: Inserting test data into database...
--------------------------------------------------------------------------------
✅ Column snippet_start_line exists
✅ Test data inserted (smell_id: 123)
   - Repository ID: 45
   - File ID: 67
   - Smell ID: 123
   - Snippet lines: 45-60

Step 2: Testing API endpoints...
--------------------------------------------------------------------------------
✅ Backend is running

Test 1: GET /api/smells
----------------------------------------
Status: 200
Smells returned: 1

Smell data:
  ID: 123
  Type: AnonymousTest
  Line numbers: {"startLine":52,"endLine":55}
  Snippet start line: 45
  Snippet end line: 60

✅ Field snippet_start_line exists in response
✅ snippet_start_line has correct value (45)
✅ snippet_end_line has correct value (60)

Test 2: GET /api/smells/{id}
----------------------------------------
Status: 200
Smell ID: 123
Snippet start line: 45
Snippet end line: 60
✅ Detail endpoint returns correct snippet_start_line

Cleaning up test data...
✅ Test data cleaned up

================================================================================
✅ ALL TESTS PASSED
================================================================================

Conclusion:
  - Backend correctly reads snippet_start_line from database
  - API correctly returns snippet_start_line in JSON response
  - Both list and detail endpoints work correctly
```

### Se o Teste Falhar:

#### Erro: "Backend is NOT running"
**Solução:** Inicie o backend em outro terminal:
```bash
cd smell-selector-ui/backend
python -m uvicorn main:app --reload
```

#### Erro: "Column snippet_start_line does not exist"
**Solução:** Execute a migração:
```bash
cd llm-refactor-pipeline
python add_snippet_columns_migration.py
```

#### Erro: "snippet_start_line field NOT in response"
**Problema:** Backend não está retornando o campo

**Verificar:** `backend/main.py` função `smell_to_response()` deve ter:
```python
"snippet_start_line": smell_row[13],
"snippet_end_line": smell_row[14],
```

#### Erro: "Expected snippet_start_line=45, got null"
**Problema:** Query SQL não está selecionando as colunas

**Verificar:** `backend/main.py` linha ~284 e ~342, query deve incluir:
```sql
ds.snippet_start_line,
ds.snippet_end_line
```

## Teste do Frontend

### Pré-requisitos:

1. Backend rodando (veja acima)
2. Frontend rodando:
   ```bash
   cd smell-selector-ui/frontend
   npm run dev
   ```

### Teste Manual no Browser:

1. Abra http://localhost:5173
2. Abra DevTools (F12)
3. Vá para a aba "Console"
4. Clique em um smell na lista
5. Verifique o console

### Resultado Esperado:

No console do browser você deve ver algo como:

```
[CodeViewer] snippetStartLine: 45
[CodeViewer] start: 45
```

E o código deve mostrar linhas começando de 45, não de 1.

### Verificar Response da API:

1. Na aba "Network" do DevTools
2. Clique em um smell
3. Encontre a requisição para `/api/smells/{id}`
4. Clique nela e vá para "Response"
5. Verifique que tem:
   ```json
   {
     "snippet_start_line": 45,
     "snippet_end_line": 60,
     ...
   }
   ```

## Teste Completo End-to-End

Para testar o fluxo completo:

1. **Backend test** (verifica API)
2. **Import real data:**
   ```bash
   # Re-detectar smells
   /analyze-smells formidable

   # Import
   db import-smells
   ```

3. **Test no browser:**
   - Abrir http://localhost:5173
   - Clicar em um smell real (não test data)
   - Verificar que linhas começam do número correto

## Troubleshooting

Se tudo passar nos testes mas não funcionar com dados reais:

1. **Verificar CSV tem methodStart e methodEnd:**
   ```bash
   head -1 smells_detected/formidable/smells.csv
   ```
   Deve ter 7 colunas.

2. **Verificar dados no banco:**
   ```bash
   sqlite3 research_data/research.db "SELECT snippet_start_line FROM detected_smells WHERE snippet_start_line IS NOT NULL LIMIT 1;"
   ```
   Deve retornar um número.

3. **Re-importar dados:**
   ```bash
   db clean --yes
   db import-smells
   ```
