#!/usr/bin/env python3
"""
Script para verificar como os novos experimentos salvarão dados completos.

Este script simula o que acontecerá quando um novo experimento for executado
com a correção implementada.
"""

import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root / "llm-refactor-pipeline" / "src"))

from llm_refactor.modules.smell_analysis.test_analyzer import (
    parse_coverage_from_summary,
    parse_test_counts_from_summary,
    load_test_summary
)

def simulate_new_experiment():
    """Simula como um novo experimento salvará dados."""
    
    print("\n" + "=" * 80)
    print("🔮 SIMULAÇÃO: Novo Experimento com Correção Implementada")
    print("=" * 80)
    
    # Simula uso de test_summary.txt real
    dataset_dir = project_root / "llm-refactor-pipeline" / "dataset"
    test_summary_files = list(dataset_dir.glob("**/test_summary.txt"))
    
    if not test_summary_files:
        print("❌ Nenhum test_summary.txt encontrado")
        return
    
    test_summary_path = test_summary_files[0]
    print(f"\n📁 Arquivo de teste usado:")
    print(f"   {test_summary_path.relative_to(project_root)}")
    
    # === CÓDIGO DA CORREÇÃO IMPLEMENTADA ===
    print("\n🔧 Executando código corrigido em _update_experiment_results():")
    print("-" * 80)
    
    # Parse test_summary.txt to extract detailed test metrics
    test_counts = None
    coverage_data = None
    
    if test_summary_path.exists():
        print("1. Carregando test_summary.txt...")
        summary_text = load_test_summary(test_summary_path)
        
        if summary_text:
            print("   ✓ Arquivo carregado")
            
            # Parse test counts (suites, tests, etc.)
            print("\n2. Parseando contagens de testes...")
            test_counts = parse_test_counts_from_summary(summary_text)
            if test_counts:
                print("   ✓ Contagens parseadas:")
                for key, value in test_counts.items():
                    print(f"     - {key}: {value}")
            
            # Parse coverage percentages
            print("\n3. Parseando coverage...")
            coverage_data = parse_coverage_from_summary(summary_text)
            if coverage_data:
                print("   ✓ Coverage parseada:")
                for key, value in coverage_data.items():
                    print(f"     - {key}: {value}%")
    
    # === DADOS QUE SERÃO SALVOS NO BANCO ===
    print("\n" + "=" * 80)
    print("💾 CHAMADA create_test_results() - Dados que irão para o banco:")
    print("=" * 80)
    
    params = {
        'session': '<database_session>',
        'experiment_id': '<experiment_id>',
        'phase': "'after'",
        # Test counts
        'test_suites_passed': test_counts.get('test_suites_passed') if test_counts else None,
        'test_suites_failed': test_counts.get('test_suites_failed') if test_counts else None,
        'test_suites_total': test_counts.get('test_suites_total') if test_counts else None,
        'tests_passed': test_counts.get('tests_passed') if test_counts else None,
        'tests_failed': test_counts.get('tests_failed') if test_counts else None,
        'tests_total': test_counts.get('tests_total') if test_counts else None,
        # Coverage percentages
        'coverage_statements': coverage_data.get('statements') if coverage_data else None,
        'coverage_branches': coverage_data.get('branches') if coverage_data else None,
        'coverage_functions': coverage_data.get('functions') if coverage_data else None,
        'coverage_lines': coverage_data.get('lines') if coverage_data else None,
        # Overall status
        'all_tests_passed': '<boolean>',
    }
    
    print("\ncreate_test_results(")
    for key, value in params.items():
        if key in ['session', 'experiment_id', 'all_tests_passed']:
            print(f"    {key}={value},")
        else:
            print(f"    {key}={value},")
    print(")")
    
    # === RESULTADO NO FRONTEND ===
    print("\n" + "=" * 80)
    print("🎨 RESULTADO NO FRONTEND smell-selector-ui:")
    print("=" * 80)
    
    print("\nTabela 'Test Results':")
    print("-" * 80)
    print(f"{'Metric':<25} {'Before':<15} {'After':<15} {'Delta'}")
    print("-" * 80)
    
    if test_counts:
        tests_display = f"{test_counts['tests_passed']}/{test_counts['tests_total']}"
        suites_display = f"{test_counts['test_suites_passed']}/{test_counts['test_suites_total']}"
    else:
        tests_display = "—/—"
        suites_display = "—/—"
    
    print(f"{'Tests passing':<25} {'—':<15} {tests_display:<15} {'—'}")
    print(f"{'Test suites passing':<25} {'—':<15} {suites_display:<15} {'—'}")
    
    if coverage_data:
        print(f"{'Coverage statements':<25} {'—':<15} {f\"{coverage_data['statements']}%\":<15} {'—'}")
        print(f"{'Coverage branches':<25} {'—':<15} {f\"{coverage_data['branches']}%\":<15} {'—'}")
        print(f"{'Coverage functions':<25} {'—':<15} {f\"{coverage_data['functions']}%\":<15} {'—'}")
        print(f"{'Coverage lines':<25} {'—':<15} {f\"{coverage_data['lines']}%\":<15} {'—'}")
    
    print("-" * 80)
    
    # === COMPARAÇÃO ===
    print("\n" + "=" * 80)
    print("📊 COMPARAÇÃO: Antes vs Depois da Correção")
    print("=" * 80)
    
    print("\n❌ ANTES (código antigo):")
    print("   create_test_results(")
    print("       session=session,")
    print("       experiment_id=experiment_id,")
    print("       phase='after',")
    print("       all_tests_passed=True  # ← Somente este campo!")
    print("   )")
    print("   Resultado no banco: tests_passed=NULL, tests_total=NULL")
    print("   Frontend mostra: —/—")
    
    print("\n✅ DEPOIS (código corrigido):")
    print("   create_test_results(")
    print("       session=session,")
    print("       experiment_id=experiment_id,")
    print("       phase='after',")
    if test_counts:
        print(f"       test_suites_passed={test_counts['test_suites_passed']},")
        print(f"       test_suites_total={test_counts['test_suites_total']},")
        print(f"       tests_passed={test_counts['tests_passed']},")
        print(f"       tests_total={test_counts['tests_total']},")
    if coverage_data:
        print(f"       coverage_statements={coverage_data['statements']},")
        print(f"       coverage_branches={coverage_data['branches']},")
    print("       all_tests_passed=True")
    print("   )")
    if test_counts:
        print(f"   Resultado no banco: tests_passed={test_counts['tests_passed']}, tests_total={test_counts['tests_total']}")
        print(f"   Frontend mostra: {test_counts['tests_passed']}/{test_counts['tests_total']} ✨")

if __name__ == "__main__":
    simulate_new_experiment()
    
    print("\n" + "=" * 80)
    print("✅ Correção Implementada com Sucesso!")
    print("=" * 80)
    print("\n📝 Próximos passos:")
    print("   1. Executar novos experimentos - dados serão salvos automaticamente")
    print("   2. Re-executar experimentos existentes (opcional):")
    print("      execute_experiment --experiment-id <id> --phase execute")
    print("   3. Dados aparecerão corretamente no frontend smell-selector-ui")
    print("\n" + "=" * 80 + "\n")
