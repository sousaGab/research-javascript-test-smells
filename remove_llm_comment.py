#!/usr/bin/env python3
"""
Script temporário para remover comentário instrucional do LLM dos códigos refatorados.

Remove a linha: // Your COMPLETE refactored test code here
"""

import sqlite3
import re

DB_PATH = 'research_data/research.db'
COMMENT_TO_REMOVE = '// Your COMPLETE refactored test code here'

def remove_instructional_comment(code):
    """Remove a linha do comentário instrucional, preservando outras linhas."""
    if not code:
        return code
    
    lines = code.split('\n')
    filtered_lines = []
    
    for line in lines:
        # Remove linha que contém exatamente o comentário (com possíveis espaços)
        if line.strip() == COMMENT_TO_REMOVE:
            continue
        filtered_lines.append(line)
    
    # Remove linha vazia no início se existir (após remover o comentário)
    result = '\n'.join(filtered_lines)
    
    # Remove múltiplas linhas vazias no início
    while result.startswith('\n\n'):
        result = result[1:]
    
    return result

def main():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Buscar todos os códigos refatorados que contêm o comentário
    cursor.execute("""
        SELECT id, refactored_code 
        FROM experiments 
        WHERE refactored_code LIKE ?
    """, (f'%{COMMENT_TO_REMOVE}%',))
    
    rows = cursor.fetchall()
    
    print(f"Encontrados {len(rows)} registros com o comentário instrucional")
    
    if len(rows) == 0:
        print("✅ Nenhum registro precisa ser atualizado")
        conn.close()
        return
    
    updated_count = 0
    
    for experiment_id, refactored_code in rows:
        # Remove o comentário
        cleaned_code = remove_instructional_comment(refactored_code)
        
        # Atualiza no banco de dados
        cursor.execute("""
            UPDATE experiments 
            SET refactored_code = ?
            WHERE id = ?
        """, (cleaned_code, experiment_id))
        
        updated_count += 1
        
        # Mostra preview para os primeiros 3
        if updated_count <= 3:
            print(f"\n--- Experimento ID {experiment_id} ---")
            print("ANTES (primeiras 3 linhas):")
            print('\n'.join(refactored_code.split('\n')[:3]))
            print("\nDEPOIS (primeiras 3 linhas):")
            print('\n'.join(cleaned_code.split('\n')[:3]))
    
    # Commit das alterações
    conn.commit()
    conn.close()
    
    print(f"\n✅ {updated_count} registros atualizados com sucesso!")
    print(f"   Comentário '{COMMENT_TO_REMOVE}' removido")

if __name__ == '__main__':
    main()
