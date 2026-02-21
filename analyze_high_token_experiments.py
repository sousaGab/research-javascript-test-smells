#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Analisa experimentos que gastaram mais de 4000 tokens
"""

import sqlite3
from pathlib import Path

# Encontrar o banco de dados
db_path = Path(__file__).parent / "research_data" / "research.db"

if not db_path.exists():
    print(f"❌ Banco de dados não encontrado em: {db_path}")
    exit(1)

print(f"📊 Analisando banco de dados: {db_path}\n")

# Conectar ao banco
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row  # Para acessar colunas por nome
cursor = conn.cursor()

# Consulta: experimentos com mais de 4000 tokens
query = """
SELECT 
    e.id,
    e.experiment_date,
    e.ai_tool,
    e.ai_model_version,
    e.prompting_approach,
    e.tokens_used,
    e.execution_time_seconds,
    e.llm_latency_seconds,
    e.smell_removed,
    e.refactoring_completed,
    e.tests_still_passing,
    bsd.smell_type,
    r.name as repository,
    f.path as file_path
FROM experiments e
LEFT JOIN baseline_smell_detections bsd ON e.baseline_smell_id = bsd.id
LEFT JOIN files f ON e.file_id = f.id
LEFT JOIN repositories r ON f.repository_id = r.id
WHERE e.tokens_used > 4000
ORDER BY e.tokens_used DESC
"""

cursor.execute(query)
results = cursor.fetchall()

if not results:
    print("✅ Nenhum experimento encontrado com mais de 4000 tokens.")
else:
    print(f"🔍 Encontrados {len(results)} experimentos com mais de 4000 tokens:\n")
    print("=" * 120)
    
    total_tokens = 0
    
    for row in results:
        total_tokens += row['tokens_used'] if row['tokens_used'] else 0
        
        print(f"\n🔹 Experimento #{row['id']}")
        print(f"   📅 Data: {row['experiment_date']}")
        print(f"   🤖 Modelo: {row['ai_tool']} / {row['ai_model_version']}")
        print(f"   📝 Abordagem: {row['prompting_approach']}")
        print(f"   🪙 Tokens: {row['tokens_used']:,}")
        print(f"   ⏱️  Tempo total: {row['execution_time_seconds']:.2f}s" if row['execution_time_seconds'] else "   ⏱️  Tempo total: N/A")
        print(f"   ⚡ LLM latency: {row['llm_latency_seconds']:.2f}s" if row['llm_latency_seconds'] else "   ⚡ LLM latency: N/A")
        print(f"   🧪 Smell type: {row['smell_type']}")
        print(f"   📁 Repositório: {row['repository']}")
        print(f"   📄 Arquivo: {row['file_path']}")
        print(f"   ✅ Smell removido: {'Sim' if row['smell_removed'] else 'Não' if row['smell_removed'] is not None else 'N/A'}")
        print(f"   ✅ Refatoração completa: {'Sim' if row['refactoring_completed'] else 'Não' if row['refactoring_completed'] is not None else 'N/A'}")
        print(f"   ✅ Testes passando: {'Sim' if row['tests_still_passing'] else 'Não' if row['tests_still_passing'] is not None else 'N/A'}")
        print("-" * 120)
    
    print(f"\n📊 ESTATÍSTICAS:")
    print(f"   • Total de experimentos: {len(results)}")
    print(f"   • Total de tokens: {total_tokens:,}")
    print(f"   • Média de tokens: {total_tokens / len(results):,.0f}")
    print(f"   • Máximo de tokens: {max(row['tokens_used'] for row in results):,}")
    print(f"   • Mínimo de tokens (>4000): {min(row['tokens_used'] for row in results):,}")

# Estatísticas por modelo
print(f"\n📊 TOKENS POR MODELO:")
cursor.execute("""
SELECT 
    ai_tool,
    ai_model_version,
    COUNT(*) as count,
    SUM(tokens_used) as total_tokens,
    AVG(tokens_used) as avg_tokens,
    MAX(tokens_used) as max_tokens
FROM experiments
WHERE tokens_used > 4000
GROUP BY ai_tool, ai_model_version
ORDER BY total_tokens DESC
""")

model_stats = cursor.fetchall()
for row in model_stats:
    print(f"   • {row['ai_tool']} / {row['ai_model_version']}: {row['count']} experimentos, {row['total_tokens']:,} tokens (média: {row['avg_tokens']:,.0f}, máx: {row['max_tokens']:,})")

# Estatísticas por smell type
print(f"\n📊 TOKENS POR SMELL TYPE:")
cursor.execute("""
SELECT 
    bsd.smell_type,
    COUNT(*) as count,
    SUM(e.tokens_used) as total_tokens,
    AVG(e.tokens_used) as avg_tokens,
    MAX(e.tokens_used) as max_tokens
FROM experiments e
LEFT JOIN baseline_smell_detections bsd ON e.baseline_smell_id = bsd.id
WHERE e.tokens_used > 4000
GROUP BY bsd.smell_type
ORDER BY total_tokens DESC
""")

smell_stats = cursor.fetchall()
for row in smell_stats:
    print(f"   • {row['smell_type']}: {row['count']} experimentos, {row['total_tokens']:,} tokens (média: {row['avg_tokens']:,.0f}, máx: {row['max_tokens']:,})")

conn.close()
print("\n✅ Análise concluída!")
