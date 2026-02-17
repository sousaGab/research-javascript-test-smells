# Database Export Guide

Este guia explica como exportar o banco de dados da pesquisa em diferentes formatos.

## Visão Geral

O banco de dados SQLite (`research_data/research.db`) contém todos os dados da pesquisa sobre test smells em JavaScript. Foram implementadas duas formas de exportação:

1. **Comando CLI integrado** - `db export`
2. **Script standalone** - `scripts/export_database.py`

Ambas as opções criam um dump SQL completo com:
- Todos os schemas (CREATE TABLE statements)
- Todos os dados (INSERT statements)
- Formato compatível com SQLite para restauração completa

## Métodos de Exportação

### Método 1: CLI Integrado

Através do CLI do llm-refactor-pipeline:

```bash
cd llm-refactor-pipeline
python -m llm_refactor db export
```

**Com caminho customizado:**
```bash
python -m llm_refactor db export --output=/caminho/destino/backup.sql
```

**Ver ajuda:**
```bash
python -m llm_refactor db help
```

### Método 2: Script Standalone

Script independente que pode ser executado diretamente:

```bash
# Exportar com timestamp automático
python scripts/export_database.py

# Exportar para caminho específico
python scripts/export_database.py --output=/tmp/meu_backup.sql

# Ver ajuda
python scripts/export_database.py --help
```

## Formato do Dump

### Nome do Arquivo (padrão)
```
research.db.dump-YYYYMMDD_HHMMSS.sql
```

Exemplo: `research.db.dump-20260217_135201.sql`

### Estrutura do Arquivo SQL

```sql
-- SQLite Database Dump
-- Database: /path/to/research.db
-- Export Date: 2026-02-17 13:52:01
-- Database Size: 40.28 MB
--

BEGIN TRANSACTION;
CREATE TABLE ai_responses (...);
CREATE TABLE repositories (...);
-- ... mais CREATE TABLE statements ...

INSERT INTO repositories VALUES(...);
INSERT INTO experiments VALUES(...);
-- ... mais INSERT statements ...

COMMIT;
```

### Tamanhos Típicos
- Banco de dados original: ~40 MB
- Dump SQL gerado: ~33 MB

## Restaurando o Banco de Dados

### Usando SQLite CLI

```bash
sqlite3 novo_banco.db < research.db.dump-20260217_135201.sql
```

### Usando Python

```python
import sqlite3

conn = sqlite3.connect('novo_banco.db')
with open('research.db.dump-20260217_135201.sql', 'r') as f:
    sql_script = f.read()
    conn.executescript(sql_script)
conn.close()
```

## Localização dos Arquivos

- **Banco de dados original:** `research_data/research.db`
- **Dumps exportados (padrão):** `research_data/research.db.dump-*.sql`
- **Script de exportação:** `scripts/export_database.py`

## Casos de Uso

### 1. Backup Regular
```bash
# Criar backup antes de operações arriscadas
python scripts/export_database.py
```

### 2. Compartilhar Dados
```bash
# Exportar para compartilhar com colaboradores
python scripts/export_database.py --output=/tmp/research_backup.sql
```

### 3. Migração
```bash
# Exportar e restaurar em outro ambiente
python scripts/export_database.py --output=/tmp/export.sql
# Em outro sistema:
sqlite3 new_database.db < /tmp/export.sql
```

### 4. Versionamento
```bash
# Criar snapshots versionados
python scripts/export_database.py --output=backups/v1.0.0-$(date +%Y%m%d).sql
```

## Verificação do Export

Para verificar que o dump está válido:

```python
import sqlite3

# Restaurar em banco temporário
conn = sqlite3.connect(':memory:')
with open('research.db.dump-20260217_135201.sql', 'r') as f:
    conn.executescript(f.read())

# Verificar tabelas
cursor = conn.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")
print(f"Tables: {cursor.fetchone()[0]}")

# Verificar dados
cursor = conn.execute("SELECT COUNT(*) FROM repositories")
print(f"Repositories: {cursor.fetchone()[0]}")

conn.close()
```

## Rotação de Backups

O sistema não deleta backups antigos automaticamente. Para gerenciar o espaço:

```bash
# Listar todos os dumps
ls -lh research_data/*.dump-*.sql

# Manter apenas os 5 mais recentes
cd research_data
ls -t research.db.dump-*.sql | tail -n +6 | xargs rm -f
```

## Comparação com Outras Opções de Backup

| Método | Formato | Tamanho | Restauração | Versionável |
|--------|---------|---------|-------------|-------------|
| **SQL Dump** (este) | Texto SQL | ~33 MB | Universal | Sim |
| Cópia do arquivo .db | Binário | ~40 MB | Direto | Parcial |
| CSV por tabela | CSVs | Variável | Manual | Sim |

## Troubleshooting

### Erro: "Database not found"
Certifique-se de que `research_data/research.db` existe:
```bash
ls -lh research_data/research.db
```

### Erro: "Permission denied"
Verifique permissões de escrita no diretório de destino:
```bash
ls -ld research_data/
chmod u+w research_data/
```

### Dump muito grande
O dump SQL inclui todos os dados. Para exportar tabelas específicas, use o CLI do SQLite ou modifique o script.

## Integração com CLI

O comando `db export` está registrado no módulo CLI principal:

- **Localização:** `llm-refactor-pipeline/src/llm_refactor/modules/database/cli_commands.py`
- **Função:** `cmd_export()`
- **Registro:** `COMMANDS` dictionary linha ~927

## Scripts Relacionados

- `scripts/export_database.py` - Script standalone
- `llm-refactor-pipeline/src/llm_refactor/modules/database/cli_commands.py` - Implementação CLI

## Próximos Passos

Funcionalidades planejadas:
- [ ] Compressão automática (gzip)
- [ ] Rotação automática de backups antigos
- [ ] Export incremental (apenas mudanças)
- [ ] Export por tabela/filtro
- [ ] Validação automática do dump
