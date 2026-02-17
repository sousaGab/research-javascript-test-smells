"""
Integration Example: Using BackupManager in the Refactoring Pipeline

This example demonstrates how to integrate BackupManager into the
refactoring workflow to safely apply LLM-generated code changes.
"""

from llm_refactor.modules.database.connection import ResearchDB
from llm_refactor.modules.database.crud import get_study_smell
from llm_refactor.modules.backup_manager import BackupManager
from llm_refactor.modules.backup_manager import (
    SnippetReplacementError,
    BackupNotFoundError,
    BackupFileNotFoundError
)
from llm_refactor.modules.refactor import (
    HuggingFaceRefactorClient,
    PromptStrategy
)


def refactor_smell_with_backup(
    smell_id: int,
    strategy_id: int = 3,  # CoT by default
    model_id: int = 1,     # Qwen by default
    apply_changes: bool = False  # Safety: don't apply by default
):
    """
    Refactor a test smell using LLM and BackupManager.
    
    This function:
    1. Retrieves the smell from the database
    2. Sends it to the LLM for refactoring
    3. Creates a backup of the original file
    4. Applies the refactored code
    5. Provides rollback capability
    
    Args:
        smell_id: Database ID of the smell to refactor
        strategy_id: Prompting strategy (1=zero-shot, 2=few-shot, 3=CoT)
        model_id: LLM model to use
        apply_changes: If True, applies changes to filesystem
        
    Returns:
        Dictionary with refactoring results and paths
    """
    
    # Initialize managers
    backup_manager = BackupManager()
    llm_client = HuggingFaceRefactorClient()
    
    # Get smell from database
    with ResearchDB() as db:
        smell = get_study_smell(db.session, smell_id)
        
        if not smell:
            return {
                "success": False,
                "error": f"Smell ID {smell_id} not found in database"
            }
        
        # Get associated file and repository
        file = smell.file
        repo = file.repository
        
        print(f"\n{'='*70}")
        print(f"Refactoring Test Smell")
        print(f"{'='*70}")
        print(f"Repository: {repo.name}")
        print(f"File: {file.path}")
        print(f"Smell Type: {smell.smell_type}")
        print(f"Strategy: {PromptStrategy.get_strategy_name(strategy_id)}")
        print(f"Model: {llm_client.get_model_name(model_id)}")
        print(f"{'='*70}\n")
        
        # Get original code
        original_code = smell.code_snippet
        print("Original Code:")
        print("-" * 70)
        print(original_code)
        print("-" * 70)
        
        # Get LLM refactoring
        print("\nSending to LLM for refactoring...")
        
        try:
            refactored_code = llm_client.refactor_smell(
                smell_type=smell.smell_type,
                code_snippet=original_code,
                strategy_id=strategy_id,
                model_id=model_id
            )
        except Exception as e:
            return {
                "success": False,
                "error": f"LLM refactoring failed: {e}"
            }
        
        print("\nRefactored Code:")
        print("-" * 70)
        print(refactored_code)
        print("-" * 70)
        
        # Prepare result
        result = {
            "success": True,
            "smell_id": smell_id,
            "repo_name": repo.name,
            "file_path": file.path,
            "smell_type": smell.smell_type,
            "original_code": original_code,
            "refactored_code": refactored_code,
            "applied": False,
            "backup_created": False
        }
        
        # Apply changes if requested
        if apply_changes:
            print("\nApplying changes to file...")
            
            try:
                # Replace snippet with backup
                modified_path, backup_created = backup_manager.replace_snippet(
                    repo_name=repo.name,
                    file_path=file.path,
                    original_snippet=original_code,
                    refactored_snippet=refactored_code,
                    create_backup=True  # Always create backup
                )
                
                result["applied"] = True
                result["backup_created"] = backup_created
                result["modified_path"] = str(modified_path)
                
                if backup_created:
                    backup_path = backup_manager._get_backup_path(
                        repo.name,
                        file.path
                    )
                    result["backup_path"] = str(backup_path)
                
                print(f"✓ Changes applied successfully")
                print(f"  Modified: {modified_path}")
                if backup_created:
                    print(f"  Backup: {backup_path}")
                
            except SnippetReplacementError as e:
                result["success"] = False
                result["error"] = f"Snippet replacement failed: {e}"
                print(f"X Failed to apply changes: {e}")
                
            except BackupFileNotFoundError as e:
                result["success"] = False
                result["error"] = f"File not found: {e}"
                print(f"X File not found: {e}")
                
            except Exception as e:
                result["success"] = False
                result["error"] = f"Unexpected error: {e}"
                print(f"✗ Unexpected error: {e}")
        
        else:
            print("\n⚠ Changes NOT applied (apply_changes=False)")
            print("  Set apply_changes=True to apply the refactoring")
        
        return result


def rollback_refactor(repo_name: str, file_path: str):
    """
    Rollback a refactoring by restoring from backup.
    
    Args:
        repo_name: Repository name
        file_path: Path to the file within the repository
        
    Returns:
        Dictionary with rollback results
    """
    backup_manager = BackupManager()
    
    print(f"\n{'='*70}")
    print(f"Rolling Back Refactoring")
    print(f"{'='*70}")
    print(f"Repository: {repo_name}")
    print(f"File: {file_path}")
    print(f"{'='*70}\n")
    
    try:
        # Check if backup exists
        if not backup_manager.backup_exists(repo_name, file_path):
            return {
                "success": False,
                "error": "No backup found for this file"
            }
        
        # Restore from backup
        restored_path = backup_manager.undo_refactor(repo_name, file_path)
        
        print(f"✓ File restored successfully from backup")
        print(f"  Restored: {restored_path}")
        
        return {
            "success": True,
            "restored_path": str(restored_path),
            "repo_name": repo_name,
            "file_path": file_path
        }
        
    except BackupNotFoundError as e:
        return {
            "success": False,
            "error": f"Backup not found: {e}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Rollback failed: {e}"
        }


def cleanup_backup(repo_name: str, file_path: str):
    """
    Delete backup after successful refactoring verification.
    
    Args:
        repo_name: Repository name
        file_path: Path to the file within the repository
        
    Returns:
        Dictionary with cleanup results
    """
    backup_manager = BackupManager()
    
    print(f"\n{'='*70}")
    print(f"Cleaning Up Backup")
    print(f"{'='*70}")
    print(f"Repository: {repo_name}")
    print(f"File: {file_path}")
    print(f"{'='*70}\n")
    
    try:
        deleted = backup_manager.delete_backup(repo_name, file_path)
        
        if deleted:
            print(f"✓ Backup deleted successfully")
            return {
                "success": True,
                "deleted": True
            }
        else:
            print(f"⚠ No backup found to delete")
            return {
                "success": True,
                "deleted": False,
                "message": "No backup found"
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": f"Cleanup failed: {e}"
        }


# =============================================================================
# Example Usage
# =============================================================================

if __name__ == "__main__":
    
    print("""
    ╔══════════════════════════════════════════════════════════════════════════╗
    ║          BackupManager Integration Example                              ║
    ╚══════════════════════════════════════════════════════════════════════════╝
    
    This example shows how to use BackupManager in the refactoring pipeline.
    
    Usage:
        1. Refactor a smell (preview only):
           result = refactor_smell_with_backup(smell_id=42)
           
        2. Refactor a smell (apply changes):
           result = refactor_smell_with_backup(smell_id=42, apply_changes=True)
           
        3. Rollback a refactor:
           result = rollback_refactor("luxon", "test/parse.test.js")
           
        4. Clean up backup after verification:
           result = cleanup_backup("luxon", "test/parse.test.js")
    
    Complete Workflow:
        # Step 1: Refactor and apply
        result = refactor_smell_with_backup(smell_id=42, apply_changes=True)
        
        # Step 2: Run tests to verify
        # (Use run_tests module here)
        
        # Step 3a: If tests pass, clean up
        if tests_passed:
            cleanup_backup(result['repo_name'], result['file_path'])
        
        # Step 3b: If tests fail, rollback
        else:
            rollback_refactor(result['repo_name'], result['file_path'])
    """)
    
    # Example: Preview refactoring for smell ID 1
    # (Change to a valid smell_id from your database)
    
    # Uncomment to run:
    # result = refactor_smell_with_backup(smell_id=1, apply_changes=False)
    # print("\nResult:", result)
