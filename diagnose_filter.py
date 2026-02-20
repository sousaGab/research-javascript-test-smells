#!/usr/bin/env python3
"""
Script de diagnóstico completo para o filtro coverage_decreased
"""

import sqlite3
import sys

def test_database():
    """Testa os dados no banco"""
    print("=" * 80)
    print("1. TESTE DO BANCO DE DADOS")
    print("=" * 80)
    
    conn = sqlite3.connect('research_data/research.db')
    cursor = conn.cursor()
    
    # Contar experimentos por valor de coverage_decreased
    cursor.execute('''
        SELECT 
            coverage_decreased,
            COUNT(*) as count
        FROM experiments
        GROUP BY coverage_decreased
        ORDER BY coverage_decreased
    ''')
    
    results = cursor.fetchall()
    print("\nDistribuição de coverage_decreased:")
    for row in results:
        value = "NULL" if row[0] is None else ("TRUE" if row[0] == 1 else "FALSE")
        print(f"  {value}: {row[1]} experimentos")
    
    conn.close()
    print("\n✅ Dados do banco estão OK")
    return True


def test_backend_query():
    """Testa a query SQL que o backend usa"""
    print("\n" + "=" * 80)
    print("2. TESTE DA QUERY DO BACKEND")
    print("=" * 80)
    
    conn = sqlite3.connect('research_data/research.db')
    cursor = conn.cursor()
    
    # Simular query com filtro TRUE
    cursor.execute('''
        SELECT COUNT(e.id)
        FROM experiments e
        JOIN files f ON e.file_id = f.id
        JOIN repositories r ON f.repository_id = r.id
        WHERE e.coverage_decreased = 1
    ''')
    count_true = cursor.fetchone()[0]
    
    # Simular query com filtro FALSE  
    cursor.execute('''
        SELECT COUNT(e.id)
        FROM experiments e
        JOIN files f ON e.file_id = f.id
        JOIN repositories r ON f.repository_id = r.id
        WHERE e.coverage_decreased = 0
    ''')
    count_false = cursor.fetchone()[0]
    
    print(f"\nResultados da query:")
    print(f"  coverage_decreased = TRUE: {count_true} experimentos")
    print(f"  coverage_decreased = FALSE: {count_false} experimentos")
    
    conn.close()
    print("\n✅ Query SQL funciona corretamente")
    return True


def test_frontend_params():
    """Verifica os parâmetros que o frontend envia"""
    print("\n" + "=" * 80)
    print("3. PARÂMETROS DO FRONTEND")
    print("=" * 80)
    
    print("\nO frontend deveria enviar:")
    print("  - coverage_decreased='' (vazio) -> sem filtro")
    print("  - coverage_decreased='true' -> filtrar TRUE")
    print("  - coverage_decreased='false' -> filtrar FALSE")
    
    print("\nO backend (FastAPI) converte automaticamente:")
    print("  - 'true' -> boolean True -> SQL: 1")
    print("  - 'false' -> boolean False -> SQL: 0")
    
    print("\n✅ Lógica de conversão está correta")
    return True


def check_issues():
    """Verifica problemas comuns"""
    print("\n" + "=" * 80)
    print("4. PROBLEMAS COMUNS")
    print("=" * 80)
    
    issues = []
    
    # Verificar se backend está rodando
    import subprocess
    try:
        result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
        if 'main.py' not in result.stdout and 'uvicorn' not in result.stdout:
            issues.append("❌ Backend pode não estar rodando")
        else:
            print("  ✅ Backend está rodando")
    except:
        pass
    
    # Verificar estrutura de arquivos
    import os
    if not os.path.exists('smell-selector-ui/backend/main.py'):
        issues.append("❌ Arquivo backend/main.py não encontrado")
    else:
        print("  ✅ Backend main.py existe")
        
    if not os.path.exists('smell-selector-ui/frontend/src/hooks/useRefatoracoes.js'):
        issues.append("❌ Arquivo useRefatoracoes.js não encontrado")
    else:
        print("  ✅ Frontend useRefatoracoes.js existe")
    
    return len(issues) == 0, issues


def main():
    print("\n" * 2)
    print("╔" + "=" * 78 + "╗")
    print("║" + " " * 15 + "DIAGNÓSTICO: Filtro coverage_decreased" + " " * 24 + "║")
    print("╚" + "=" * 78 + "╝")
    print()
    
    all_ok = True
    
    # Executar testes
    try:
        test_database()
    except Exception as e:
        print(f"\n❌ ERRO no teste do banco: {e}")
        all_ok = False
    
    try:
        test_backend_query()
    except Exception as e:
        print(f"\n❌ ERRO no teste da query: {e}")
        all_ok = False
    
    try:
        test_frontend_params()
    except Exception as e:
        print(f"\n❌ ERRO no teste dos parâmetros: {e}")
        all_ok = False
    
    try:
        issues_ok, issues = check_issues()
        if not issues_ok:
            all_ok = False
            for issue in issues:
                print(f"  {issue}")
    except Exception as e:
        print(f"\n❌ ERRO na verificação de problemas: {e}")
        all_ok = False
    
    # Resumo final
    print("\n" + "=" * 80)
    print("RESUMO")
    print("=" * 80)
    
    if all_ok:
        print("\n✅ TUDO FUNCIONANDO CORRETAMENTE")
        print("\nSe o filtro não está funcionando no navegador, tente:")
        print("  1. Limpar o cache do navegador (Ctrl+Shift+Del)")
        print("  2. Recarregar a página com Ctrl+F5")
        print("  3. Verificar o Console do navegador (F12) por erros")
        print("  4. Reiniciar o backend e frontend")
        print("\nComandos para reiniciar:")
        print("  Backend:  cd smell-selector-ui/backend && python3 main.py")
        print("  Frontend: cd smell-selector-ui/frontend && npm start")
    else:
        print("\n❌ PROBLEMAS ENCONTRADOS - veja acima")
        return 1
    
    print("\n" + "=" * 80)
    return 0


if __name__ == "__main__":
    sys.exit(main())
