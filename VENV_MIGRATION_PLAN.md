# Virtual Environment Consolidation - Migration Plan

## Executive Summary

This document outlines the plan to consolidate multiple Python virtual environments into a single unified virtual environment at the project root level.

## Current State Analysis

### Existing Virtual Environments
1. **Root level**: `.venv/` (already exists)
2. **tools/hugging_face**: `.venv/` (exists)
3. **llm-refactor-pipeline**: May have separate venv
4. **smell-selector-ui/backend**: May have separate venv

### Dependencies Identified

#### smell-selector-ui/backend
```
fastapi==0.115.0
uvicorn[standard]==0.32.0
pydantic==2.9.2
sqlalchemy==2.0.36
python-multipart==0.0.17
```

#### llm-refactor-pipeline
```
prompt-toolkit>=3.0.0
rich>=13.0.0
sqlalchemy>=2.0.0
pandas>=2.0.0
```

#### tools/hugging_face
```
openai (detected from imports)
python-dotenv (detected from imports)
```

#### repositories_list/filter_script.py
```
requests (detected from imports)
python-dotenv (detected from imports)
```

#### scripts/check_smells.py
```
pandas (detected from imports)
```

### Dependency Conflicts Analysis

✅ **No critical conflicts detected**

- `sqlalchemy`: Both use 2.0.x versions (compatible)
- `pandas`: Both use >= 2.0.0 (compatible)
- All other dependencies are either identical or compatible

## Migration Plan

### Phase 1: Preparation ✅ COMPLETED

1. ✅ Analyze all Python dependencies across the project
2. ✅ Identify version conflicts
3. ✅ Create consolidated requirements.txt
4. ✅ Create setup documentation (VENV_SETUP.md)
5. ✅ Create automated setup script (setup_venv.sh)

### Phase 2: Implementation (Manual)

#### Step 1: Backup Current State
```bash
# Optional: Create backups of existing venvs
tar -czf venv_backup_$(date +%Y%m%d).tar.gz \
    tools/hugging_face/.venv \
    llm-refactor-pipeline/.venv 2>/dev/null || true
```

#### Step 2: Setup Unified Environment
```bash
# Option A: Use the automated script
./setup_venv.sh

# Option B: Manual setup
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install -e llm-refactor-pipeline/
```

#### Step 3: Test Each Component

**Test 1: Smell Selector UI Backend**
```bash
source .venv/bin/activate
cd smell-selector-ui/backend
# Test imports
python -c "import fastapi, uvicorn, pydantic, sqlalchemy; print('✓ Backend OK')"
```

**Test 2: LLM Refactor Pipeline**
```bash
source .venv/bin/activate
llm-refactor --help
# Or
python -m llm_refactor --help
```

**Test 3: Hugging Face Tools**
```bash
source .venv/bin/activate
cd tools/hugging_face
python -c "import openai; from dotenv import load_dotenv; print('✓ HF Tools OK')"
```

**Test 4: Analysis Scripts**
```bash
source .venv/bin/activate
python -c "import pandas, requests; print('✓ Scripts OK')"
```

#### Step 4: Cleanup (Optional)
```bash
# Only after confirming everything works
rm -rf tools/hugging_face/.venv
rm -rf llm-refactor-pipeline/.venv 2>/dev/null || true
rm -rf smell-selector-ui/backend/.venv 2>/dev/null || true
```

### Phase 3: Documentation Updates

1. ✅ Create VENV_SETUP.md with complete instructions
2. ✅ Create setup_venv.sh automated script
3. Update README.md to reference new setup process
4. Add deprecation notices to old requirements.txt files

## Implementation Checklist

### Pre-Migration
- [x] Analyze all Python files for imports
- [x] Document all dependencies
- [x] Check for version conflicts
- [x] Create consolidated requirements.txt
- [x] Create setup documentation
- [x] Create automated setup script

### Migration
- [ ] Run setup_venv.sh or manually setup environment
- [ ] Activate root .venv
- [ ] Install all dependencies
- [ ] Install llm-refactor-pipeline in editable mode

### Testing
- [ ] Test smell-selector-ui backend imports
- [ ] Test llm-refactor-pipeline CLI
- [ ] Test hugging_face tools
- [ ] Test analysis scripts
- [ ] Test filter_script.py
- [ ] Verify all imports work correctly

### Cleanup
- [ ] Remove old .venv directories (optional)
- [ ] Add deprecation notices to subdirectory requirements.txt
- [ ] Update main README.md

### Documentation
- [ ] Review VENV_SETUP.md
- [ ] Update project README
- [ ] Add migration completion notes

## Benefits

### Before (Multiple VENVs)
```
Total disk space: ~500MB+ (duplicated packages)
Setup complexity: High (multiple venvs to manage)
Consistency: Low (different package versions possible)
Maintenance: Difficult (update each venv separately)
```

### After (Unified VENV)
```
Total disk space: ~200MB (shared packages)
Setup complexity: Low (single venv)
Consistency: High (same versions everywhere)
Maintenance: Easy (single update command)
```

## Risk Mitigation

### Risk 1: Dependency Conflicts
**Mitigation**: Pre-analysis shows no conflicts. All dependencies are compatible.

### Risk 2: Tools Break After Migration
**Mitigation**: 
- Keep original requirements.txt files
- Document rollback procedure
- Test each tool before cleanup

### Risk 3: Different Python Version Requirements
**Mitigation**: 
- All tools use Python 3.8+
- Root venv uses system Python (3.8+)
- Document Python version requirements

## Rollback Procedure

If migration fails:

1. Recreate individual virtual environments:
   ```bash
   cd tools/hugging_face
   python3 -m venv .venv
   source .venv/bin/activate
   pip install openai python-dotenv
   ```

2. Use original requirements.txt files in subdirectories

3. Restore from backup if created:
   ```bash
   tar -xzf venv_backup_YYYYMMDD.tar.gz
   ```

## Next Steps

1. **Review this plan** with team/stakeholders
2. **Run setup_venv.sh** to create unified environment
3. **Test all components** systematically
4. **Update documentation** when confirmed working
5. **Clean up old venvs** after successful migration

## Tools Summary

### Python-Based Tools
- ✅ smell-selector-ui/backend (FastAPI web server)
- ✅ llm-refactor-pipeline (CLI tool)
- ✅ tools/hugging_face (LLM experimentation)
- ✅ scripts/check_smells.py (Analysis script)
- ✅ repositories_list/filter_script.py (Repository filtering)

### Node.js-Based Tools (Not Affected)
- smell-selector-ui/frontend (React/Vite)
- smell_detection_tools/snutsjs (Jest smell detection)
- smell_detection_tools/steel (Test smell analyzer)
- All repositories in /repositories/ (Research subjects)

## Dependency Matrix

| Package | smell-selector-ui | llm-refactor | hf-tools | scripts | Consolidated |
|---------|-------------------|--------------|----------|---------|--------------|
| fastapi | 0.115.0 | - | - | - | 0.115.0 |
| uvicorn | 0.32.0 | - | - | - | 0.32.0 |
| pydantic | 2.9.2 | - | - | - | 2.9.2 |
| sqlalchemy | 2.0.36 | >=2.0.0 | - | - | 2.0.36 |
| pandas | - | >=2.0.0 | - | ✓ | >=2.0.0 |
| prompt-toolkit | - | >=3.0.0 | - | - | >=3.0.0 |
| rich | - | >=13.0.0 | - | - | >=13.0.0 |
| openai | - | - | ✓ | - | >=1.0.0 |
| python-dotenv | - | - | ✓ | ✓ | >=1.0.0 |
| requests | - | - | - | ✓ | >=2.31.0 |
| python-multipart | 0.0.17 | - | - | - | 0.0.17 |

✓ = Used but not in requirements file
- = Not used

## Maintenance Going Forward

### Adding New Dependencies
1. Install: `pip install package-name`
2. Update requirements.txt in appropriate section
3. Keep organized by tool category

### Updating Dependencies
1. Update version in requirements.txt
2. Run: `pip install -r requirements.txt --upgrade`
3. Test all tools
4. Commit changes

### Development Dependencies
Uncomment the development section in requirements.txt when needed:
- pytest
- black
- ruff
- pytest-cov
- pytest-asyncio

## Contact & Support

For issues or questions:
- Review VENV_SETUP.md for detailed instructions
- Check this migration plan for context
- Test systematically using the testing checklist

---

**Status**: ✅ Planning Complete - Ready for Implementation  
**Created**: February 2026  
**Last Updated**: February 16, 2026
