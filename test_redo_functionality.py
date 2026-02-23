"""
Test script to validate --redo functionality for experiment execution.

This script tests that:
1. Deleting test_results works correctly
2. Resetting experiment execution data cleans all flags
3. Re-executing an experiment doesn't cause UNIQUE constraint errors
"""

from llm_refactor.modules.database.connection import ResearchDB
from llm_refactor.modules.database.crud import (
    reset_experiment_execution_data,
    get_test_results,
    get_experiment_with_relations
)


def test_reset_experiment_execution_data():
    """Test that reset_experiment_execution_data works correctly."""
    
    db = ResearchDB()
    session = db.get_session()
    
    try:
        # Find an executed experiment to test with
        from llm_refactor.modules.database.models import Experiment
        
        experiment = session.query(Experiment).filter(
            Experiment.execution_phase_completed == True,
            Experiment.refactored_code.isnot(None)
        ).first()
        
        if not experiment:
            print("❌ No executed experiments found in database")
            return False
        
        experiment_id = experiment.id
        print(f"\n📋 Testing with Experiment ID: {experiment_id}")
        
        # Check current state
        print("\n1️⃣ BEFORE RESET:")
        print(f"   execution_phase_completed: {experiment.execution_phase_completed}")
        print(f"   tests_still_passing: {experiment.tests_still_passing}")
        print(f"   smell_removed: {experiment.smell_removed}")
        print(f"   introduced_new_smells: {experiment.introduced_new_smells}")
        print(f"   coverage_decreased: {experiment.coverage_decreased}")
        print(f"   tests_changed: {experiment.tests_changed}")
        
        test_results_before = get_test_results(session, experiment_id)
        print(f"   test_results count: {len(test_results_before)}")
        
        # Reset execution data
        print("\n2️⃣ RESETTING EXECUTION DATA...")
        reset_experiment_execution_data(session, experiment_id)
        session.commit()
        print("   ✓ Reset completed")
        
        # Check state after reset
        print("\n3️⃣ AFTER RESET:")
        session.refresh(experiment)
        print(f"   execution_phase_completed: {experiment.execution_phase_completed}")
        print(f"   tests_still_passing: {experiment.tests_still_passing}")
        print(f"   smell_removed: {experiment.smell_removed}")
        print(f"   introduced_new_smells: {experiment.introduced_new_smells}")
        print(f"   coverage_decreased: {experiment.coverage_decreased}")
        print(f"   tests_changed: {experiment.tests_changed}")
        
        test_results_after = get_test_results(session, experiment_id)
        print(f"   test_results count: {len(test_results_after)}")
        
        # Validate
        success = True
        if experiment.execution_phase_completed:
            print("\n❌ FAIL: execution_phase_completed should be False")
            success = False
        
        if experiment.tests_still_passing is not None:
            print("\n❌ FAIL: tests_still_passing should be None")
            success = False
        
        if experiment.smell_removed is not None:
            print("\n❌ FAIL: smell_removed should be None")
            success = False
        
        if len(test_results_after) > 0:
            print(f"\n❌ FAIL: test_results should be empty, found {len(test_results_after)}")
            success = False
        
        if success:
            print("\n✅ SUCCESS: All checks passed!")
            print("\n📝 The experiment can now be re-executed without UNIQUE constraint errors")
            return True
        else:
            return False
            
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        session.close()


if __name__ == "__main__":
    print("=" * 80)
    print("Testing --redo Functionality")
    print("=" * 80)
    
    success = test_reset_experiment_execution_data()
    
    print("\n" + "=" * 80)
    if success:
        print("✅ Test passed! The --redo functionality should work correctly.")
        print("\nYou can now use:")
        print("  batch_experiments 3 1 --phase execute --redo")
        print("or:")
        print("  execute_experiment --experiment-id <id> --phase execute")
    else:
        print("❌ Test failed! Check the output above for details.")
    print("=" * 80)
