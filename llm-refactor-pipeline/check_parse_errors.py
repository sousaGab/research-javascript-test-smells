#!/usr/bin/env python3
"""
Check how many experiments have parse errors (NULL Halstead metrics).
"""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent / "src"))

from llm_refactor.modules.database.connection import ResearchDB
from llm_refactor.modules.database.models import CodeMetric, Experiment
from sqlalchemy import func, and_

def check_parse_errors():
    """Check experiments with parse errors in after phase."""
    db = ResearchDB()
    session = db.get_session()
    
    try:
        print("\n" + "=" * 80)
        print("PARSE ERROR ANALYSIS")
        print("=" * 80)
        
        # Total experiments
        total_experiments = session.query(func.count(Experiment.id)).scalar()
        print(f"\nTotal experiments: {total_experiments}")
        
        # Experiments with after metrics
        experiments_with_after = session.query(func.count(CodeMetric.id)).filter(
            CodeMetric.phase == 'after'
        ).scalar()
        print(f"Experiments with 'after' metrics: {experiments_with_after}")
        
        # Experiments with NULL Halstead (parse errors)
        parse_errors = session.query(CodeMetric).filter(
            and_(
                CodeMetric.phase == 'after',
                CodeMetric.sloc_logical.isnot(None),  # Has SLOC (fallback worked)
                CodeMetric.halstead_effort.is_(None)   # But no Halstead (parse failed)
            )
        ).all()
        
        print(f"\nExperiments with parse errors: {len(parse_errors)}")
        if experiments_with_after > 0:
            print(f"Parse error rate: {len(parse_errors) / experiments_with_after * 100:.4f}%")
        
        if parse_errors:
            print("\n" + "-" * 80)
            print("EXPERIMENTS WITH PARSE ERRORS:")
            print("-" * 80)
            print(f"{'Exp ID':<10} {'SLOC':<10} {'Cyclomatic':<15} {'Smell ID':<12} {'Model'}")
            print("-" * 80)
            
            for metric in parse_errors:
                exp = session.query(Experiment).filter_by(id=metric.experiment_id).first()
                if exp:
                    model = exp.ai_model_version[:40] if exp.ai_model_version else "N/A"
                    print(f"{exp.id:<10} {metric.sloc_logical:<10} "
                          f"{metric.cyclomatic_complexity:<15} "
                          f"{exp.study_smell_id:<12} {model}")
            
            # Group by model
            print("\n" + "-" * 80)
            print("PARSE ERRORS BY MODEL:")
            print("-" * 80)
            
            model_errors = {}
            for metric in parse_errors:
                exp = session.query(Experiment).filter_by(id=metric.experiment_id).first()
                if exp and exp.ai_model_version:
                    model = exp.ai_model_version
                    model_errors[model] = model_errors.get(model, 0) + 1
            
            for model, count in sorted(model_errors.items(), key=lambda x: x[1], reverse=True):
                print(f"{model}: {count} errors")
            
            # Group by smell type
            print("\n" + "-" * 80)
            print("PARSE ERRORS BY SMELL TYPE:")
            print("-" * 80)
            
            smell_errors = {}
            for metric in parse_errors:
                exp = session.query(Experiment).filter_by(id=metric.experiment_id).first()
                if exp and exp.study_smell:
                    smell_type = exp.study_smell.smell_type
                    smell_errors[smell_type] = smell_errors.get(smell_type, 0) + 1
            
            for smell, count in sorted(smell_errors.items(), key=lambda x: x[1], reverse=True):
                print(f"{smell}: {count} errors")
        else:
            print("\n✅ No parse errors found! All experiments have valid code metrics.")
        
        # Check if there are experiments with NO metrics at all (not even fallback)
        experiments_without_metrics = session.query(Experiment).outerjoin(
            CodeMetric,
            and_(
                CodeMetric.experiment_id == Experiment.id,
                CodeMetric.phase == 'after'
            )
        ).filter(
            Experiment.refactored_code.isnot(None),
            CodeMetric.id.is_(None)
        ).all()
        
        if experiments_without_metrics:
            print("\n" + "=" * 80)
            print(f"⚠️  EXPERIMENTS WITHOUT ANY METRICS: {len(experiments_without_metrics)}")
            print("=" * 80)
            for exp in experiments_without_metrics[:10]:  # Show first 10
                print(f"Experiment {exp.id} - Smell {exp.study_smell_id}")
        
        print("\n" + "=" * 80)
        
    finally:
        session.close()

if __name__ == "__main__":
    check_parse_errors()
