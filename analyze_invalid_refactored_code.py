#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Analisa experimentos para encontrar códigos refatorados inválidos
(sem métodos JavaScript ou com texto sem comentários)
"""

import sqlite3
import re
from pathlib import Path

# Encontrar o banco de dados
db_path = Path(__file__).parent / "research_data" / "research.db"

if not db_path.exists():
    print(f"❌ Banco de dados não encontrado em: {db_path}")
    exit(1)

print(f"📊 Analisando banco de dados: {db_path}\n")

# Conectar ao banco
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

def has_javascript_function(code):
    """Verifica se o código contém alguma função/método JavaScript"""
    if not code or code.strip() == '':
        return False
    
    # Padrões de funções JavaScript
    patterns = [
        r'function\s+\w+\s*\(',  # function name()
        r'function\s*\(',  # function ()
        r'\w+\s*:\s*function\s*\(',  # name: function()
        r'\w+\s*\([^)]*\)\s*{',  # name() { (arrow ou método)
        r'=>\s*{',  # arrow function
        r'const\s+\w+\s*=\s*\(',  # const name = (
        r'let\s+\w+\s*=\s*\(',  # let name = (
        r'var\s+\w+\s*=\s*\(',  # var name = (
        r'class\s+\w+',  # class Name
        r'\w+\s*\([^)]*\)\s*\{',  # método
        r'async\s+function',  # async function
        r'async\s+\w+\s*\(',  # async name()
    ]
    
    for pattern in patterns:
        if re.search(pattern, code, re.MULTILINE):
            return True
    
    return False

def has_uncommented_text(code):
    """Verifica se há texto que parece ser prosa/explicação sem comentários"""
    if not code or code.strip() == '':
        return False
    
    # Remove comentários de linha
    temp = re.sub(r'//.*$', '', code, flags=re.MULTILINE)
    # Remove comentários de bloco
    temp = re.sub(r'/\*.*?\*/', '', temp, flags=re.DOTALL)
    # Remove strings
    temp = re.sub(r'"[^"]*"', '', temp)
    temp = re.sub(r"'[^']*'", '', temp)
    temp = re.sub(r'`[^`]*`', '', temp)
    
    # Procura por linhas que parecem texto explicativo
    lines = temp.split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Verifica se a linha tem palavras em sequência sem sintaxe de código
        # Linhas muito longas com espaços (provavelmente prosa)
        words = line.split()
        if len(words) > 10 and not any(char in line for char in ['{', '}', '(', ')', ';', '=']):
            return True
        
        # Linhas que começam com letras maiúsculas seguidas de frase
        if re.match(r'^[A-Z][a-z]+\s+[a-z]+\s+[a-z]+', line):
            # Mas não é TypeScript/JSDoc
            if not line.startswith('import') and not line.startswith('export') and not line.startswith('const') and not line.startswith('let'):
                return True
    
    return False

def analyze_code(code, code_type='refactored_code'):
    """Analisa um código e retorna problemas encontrados"""
    issues = []
    
    if not code or code.strip() == '':
        issues.append('empty')
        return issues
    
    if not has_javascript_function(code):
        issues.append('no_function')
    
    if has_uncommented_text(code):
        issues.append('uncommented_text')
    
    # Verifica se é muito curto (provavelmente não é código válido)
    if len(code.strip()) < 20:
        issues.append('too_short')
    
    # Verifica se contém mensagens de erro ou texto do LLM
    llm_phrases = [
        'I apologize',
        'I cannot',
        'I am not able',
        'I do not have',
        'Here is',
        'Here are',
        'Based on',
        'The refactored',
        'This refactoring',
        'Note that',
        'Please note',
        'Sorry',
    ]
    
    for phrase in llm_phrases:
        if phrase.lower() in code.lower():
            issues.append('llm_response_text')
            break
    
    return issues

# Consulta todos os experimentos
query = """
SELECT 
    e.id,
    e.experiment_date,
    e.ai_tool,
    e.ai_model_version,
    e.prompting_approach,
    e.refactored_code,
    e.refactored_method,
    e.original_code,
    e.original_method,
    e.refactoring_completed,
    e.smell_removed,
    bsd.smell_type,
    r.name as repository,
    f.path as file_path
FROM experiments e
LEFT JOIN baseline_smell_detections bsd ON e.baseline_smell_id = bsd.id
LEFT JOIN files f ON e.file_id = f.id
LEFT JOIN repositories r ON f.repository_id = r.id
ORDER BY e.id ASC
"""

cursor.execute(query)
results = cursor.fetchall()

print(f"📋 Total de experimentos: {len(results)}\n")

# Categorias de problemas
problematic_experiments = []

for row in results:
    # Prioriza refactored_method se existir
    refactored_code = row['refactored_method'] if row['refactored_method'] else row['refactored_code']
    code_type = 'refactored_method' if row['refactored_method'] else 'refactored_code'
    
    issues = analyze_code(refactored_code, code_type)
    
    if issues:
        problematic_experiments.append({
            'id': row['id'],
            'date': row['experiment_date'],
            'model': f"{row['ai_tool']} / {row['ai_model_version']}",
            'approach': row['prompting_approach'],
            'smell_type': row['smell_type'],
            'repository': row['repository'],
            'file_path': row['file_path'],
            'refactoring_completed': row['refactoring_completed'],
            'smell_removed': row['smell_removed'],
            'code_type': code_type,
            'code_length': len(refactored_code) if refactored_code else 0,
            'issues': issues,
            'code_preview': refactored_code[:200] if refactored_code else ''
        })

# Relatório
print("=" * 120)
print(f"🔍 EXPERIMENTOS COM CÓDIGO REFATORADO PROBLEMÁTICO: {len(problematic_experiments)}")
print("=" * 120)

# Agrupa por tipo de problema
issue_categories = {
    'empty': [],
    'no_function': [],
    'uncommented_text': [],
    'too_short': [],
    'llm_response_text': []
}

for exp in problematic_experiments:
    for issue in exp['issues']:
        issue_categories[issue].append(exp)

# Relatório por categoria
print("\n📊 RESUMO POR TIPO DE PROBLEMA:\n")

for issue_type, exps in issue_categories.items():
    if not exps:
        continue
    
    issue_names = {
        'empty': 'Código vazio',
        'no_function': 'Sem função/método JavaScript',
        'uncommented_text': 'Texto sem comentários',
        'too_short': 'Código muito curto (<20 chars)',
        'llm_response_text': 'Resposta de LLM (não código)'
    }
    
    print(f"🔸 {issue_names[issue_type]}: {len(exps)} experimentos")

# Detalhamento dos experimentos mais problemáticos
print("\n" + "=" * 120)
print("📋 DETALHAMENTO DOS EXPERIMENTOS PROBLEMÁTICOS")
print("=" * 120)

# Ordena por número de problemas (mais problemáticos primeiro)
problematic_experiments.sort(key=lambda x: len(x['issues']), reverse=True)

for i, exp in enumerate(problematic_experiments[:50], 1):  # Mostra até 50
    print(f"\n{i}. 🔹 Experimento #{exp['id']}")
    print(f"   📅 Data: {exp['date']}")
    print(f"   🤖 Modelo: {exp['model']}")
    print(f"   📝 Abordagem: {exp['approach']}")
    print(f"   🧪 Smell: {exp['smell_type']}")
    print(f"   📁 Repo: {exp['repository']} - {exp['file_path']}")
    print(f"   📊 Refatoração completa: {'Sim' if exp['refactoring_completed'] else 'Não'}")
    print(f"   📊 Smell removido: {'Sim' if exp['smell_removed'] else 'Não' if exp['smell_removed'] is not None else 'N/A'}")
    print(f"   ⚠️  Problemas encontrados: {', '.join(exp['issues'])}")
    print(f"   📏 Tamanho do código: {exp['code_length']} caracteres")
    
    if exp['code_preview']:
        preview = exp['code_preview'].replace('\n', ' ')[:150]
        print(f"   👁️  Preview: {preview}...")
    
    print("-" * 120)

# Estatísticas gerais
print("\n" + "=" * 120)
print("📊 ESTATÍSTICAS GERAIS")
print("=" * 120)

total_experiments = len(results)
problematic_count = len(problematic_experiments)
valid_count = total_experiments - problematic_count

print(f"\n✅ Experimentos com código válido: {valid_count} ({valid_count/total_experiments*100:.1f}%)")
print(f"⚠️  Experimentos com problemas: {problematic_count} ({problematic_count/total_experiments*100:.1f}%)")

# Estatísticas por modelo
print("\n📊 PROBLEMAS POR MODELO:")
cursor.execute("""
SELECT 
    ai_tool,
    ai_model_version,
    COUNT(*) as total
FROM experiments
GROUP BY ai_tool, ai_model_version
ORDER BY total DESC
""")

model_totals = {f"{row['ai_tool']} / {row['ai_model_version']}": row['total'] for row in cursor.fetchall()}

model_problems = {}
for exp in problematic_experiments:
    model = exp['model']
    if model not in model_problems:
        model_problems[model] = 0
    model_problems[model] += 1

for model, total in model_totals.items():
    problems = model_problems.get(model, 0)
    print(f"   • {model}: {problems}/{total} problemáticos ({problems/total*100:.1f}%)")

conn.close()
print("\n✅ Análise concluída!")
