#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Verifica estrutura do banco de dados
"""

import sqlite3
from pathlib import Path

# Encontrar o banco de dados
db_path = Path(__file__).parent / "smell-selector-ui" / "research.db"

if not db_path.exists():
    print(f"Banco de dados não encontrado em: {db_path}")
    exit(1)

print(f"Banco de dados: {db_path}\n")

# Conectar ao banco
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Listar todas as tabelas
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

print("Tabelas no banco de dados:")
for table in tables:
    print(f"  - {table[0]}")

conn.close()
