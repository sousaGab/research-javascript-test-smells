#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Consulta experimentos com tokens acima de 4096, agrupados por modelo e tipo de prompt.
Retorna smell_id e experiment_id.
"""

import sqlite3
from pathlib import Path
from collections import defaultdict

# Encontrar o banco de dados
db_path = Path(__file__).parent / "research_data" / "research.db"

if not db_path.exists():
    print(f"❌ Banco de dados não encontrado em: {db_path}")
    exit(1)

print(f"📊 Consultando banco de dados: {db_path}\n")

# Conectar ao banco
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Consulta: experimentos com mais de 4096 tokens
query = """
SELECT 
    e.id as experiment_id,
    COALESCE(e.study_smell_id, e.baseline_smell_id) as smell_id,
    e.ai_tool,
    e.ai_model_version,
    e.prompting_approach,
    e.tokens_used
FROM experiments e
WHERE e.tokens_used > 4096
ORDER BY e.ai_tool, e.ai_model_version, e.prompting_approach, e.tokens_used DESC
"""

cursor.execute(query)
results = cursor.fetchall()

if not results:
    print("✅ Nenhum experimento encontrado com mais de 4096 tokens.")
    conn.close()
    exit(0)

# Agrupar por modelo e tipo de prompt
grouped = defaultdict(list)
for row in results:
    model_key = f"{row['ai_tool']} - {row['ai_model_version']}"
    prompt_type = row['prompting_approach'] or 'N/A'
    key = (model_key, prompt_type)
    grouped[key].append(row)

# Exibir resultados agrupados
print(f"🔍 Encontrados {len(results)} experimentos com tokens > 4096\n")
print("=" * 120)

total_experiments = 0
for (model, prompt_type), experiments in sorted(grouped.items()):
    print(f"\n📌 MODELO: {model}")
    print(f"📌 TIPO DE PROMPT: {prompt_type}")
    print(f"📌 TOTAL: {len(experiments)} experimentos")
    print("-" * 120)
    print(f"{'Experiment ID':<15} {'Smell ID':<15} {'Tokens':<15}")
    print("-" * 120)
    
    for exp in experiments:
        smell_id = exp['smell_id'] if exp['smell_id'] else 'N/A'
        print(f"{exp['experiment_id']:<15} {smell_id:<15} {exp['tokens_used']:<15,}")
    
    total_experiments += len(experiments)
    print("-" * 120)

# Estatísticas gerais
print(f"\n📊 RESUMO GERAL:")
print(f"   • Total de experimentos: {total_experiments}")
print(f"   • Total de grupos (modelo + prompt): {len(grouped)}")
print(f"   • Tokens médios: {sum(r['tokens_used'] for r in results) / len(results):,.0f}")
print(f"   • Tokens máximos: {max(r['tokens_used'] for r in results):,}")
print(f"   • Tokens mínimos (>4096): {min(r['tokens_used'] for r in results):,}")

# Estatísticas por modelo
print(f"\n📊 CONTAGEM POR MODELO:")
model_counts = defaultdict(int)
for row in results:
    model_key = f"{row['ai_tool']} - {row['ai_model_version']}"
    model_counts[model_key] += 1

for model, count in sorted(model_counts.items(), key=lambda x: x[1], reverse=True):
    print(f"   • {model}: {count} experimentos")

# Estatísticas por tipo de prompt
print(f"\n📊 CONTAGEM POR TIPO DE PROMPT:")
prompt_counts = defaultdict(int)
for row in results:
    prompt_type = row['prompting_approach'] or 'N/A'
    prompt_counts[prompt_type] += 1

for prompt_type, count in sorted(prompt_counts.items(), key=lambda x: x[1], reverse=True):
    print(f"   • {prompt_type}: {count} experimentos")

conn.close()
print("\n✅ Consulta concluída!")
