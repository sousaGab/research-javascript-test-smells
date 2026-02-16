# Refactor Command - HuggingFace LLM Integration

## Overview

The `refactor` command integrates HuggingFace's LLM API with the research database to automatically refactor JavaScript test smells using state-of-the-art language models.

## Features

- ✅ Database integration - fetches smells directly from the study_smells table
- ✅ Multiple prompt strategies (Zero-Shot, Few-Shot, Chain-of-Thought)
- ✅ Support for 6+ HuggingFace models
- ✅ Easy model and strategy selection via numeric IDs
- ✅ Detailed output with original and refactored code
- ✅ Built-in help and model/strategy listing

## Quick Start

### 1. Setup HuggingFace Token

Add your HuggingFace API token to the `.env` file:

```bash
# In project root .env file
HF_TOKEN=your_huggingface_token_here
```

Get your token from: https://huggingface.co/settings/tokens

### 2. Basic Usage

```bash
# Start the LLM refactoring pipeline
source .venv/bin/activate
llm-refactor

# In the REPL, refactor a smell with defaults (CoT + Qwen)
>>> refactor 42

# Use specific strategy and model
>>> refactor 42 1 4
#         ↑   ↑ ↑
#         |   | └─ Model ID (4 = DeepSeek R1)
#         |   └─── Strategy ID (1 = Zero-Shot)
#         └─────── Smell ID from database
```

## Command Syntax

```
refactor <smell_id> [strategy] [model]
```

### Arguments

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| `smell_id` | ✅ Yes | - | Database ID of the smell to refactor |
| `strategy` | ❌ No | 3 (CoT) | Prompt strategy ID (1-3) |
| `model` | ❌ No | 1 (Qwen) | Model ID (see available models) |

## Prompt Strategies

### [1] Zero-Shot
Direct refactoring without examples. Best for simple, well-defined smells.

**Example:**
```bash
>>> refactor 42 1
```

### [2] Few-Shot
Refactoring with example demonstrations from the smell catalog. Best for complex patterns.

**Example:**
```bash
>>> refactor 42 2
```

### [3] Chain-of-Thought (Recommended) ⭐
Step-by-step reasoning approach. Best for accurate and thoughtful refactoring.

**Example:**
```bash
>>> refactor 42 3
```

## Available Models

| ID | Model Name | Provider | Description |
|----|------------|----------|-------------|
| 1 | Qwen 2.5 Coder 32B | Default | High-quality code generation (DEFAULT) ⭐ |
| 2 | Qwen 2.5 Coder 32B | Together | Via Together AI provider |
| 3 | Qwen 2.5 Coder 32B | DeepInfra | Via DeepInfra provider |
| 4 | DeepSeek R1 | Novita | Advanced reasoning model |
| 5 | DeepSeek R1 Distill | Novita | Faster distilled version |
| 6 | Llama 3.1 70B | Default | Meta's large language model |

### View Models in CLI

```bash
>>> refactor models
```

## Examples

### Example 1: Quick Refactor (Defaults)
```bash
>>> refactor 42
# Uses: Chain-of-Thought + Qwen 2.5 Coder 32B
```

### Example 2: Zero-Shot with Default Model
```bash
>>> refactor 42 1
# Strategy: Zero-Shot
# Model: Qwen 2.5 Coder 32B
```

### Example 3: Few-Shot with DeepSeek
```bash
>>> refactor 42 2 4
# Strategy: Few-Shot
# Model: DeepSeek R1
```

### Example 4: CoT with Llama
```bash
>>> refactor 42 3 6
# Strategy: Chain-of-Thought
# Model: Llama 3.1 70B
```

## Utility Commands

### Get Help
```bash
>>> refactor help
```

### List Available Models
```bash
>>> refactor models
```

### List Prompt Strategies
```bash
>>> refactor strategies
```

## Output Format

The refactor command provides structured output:

```
╔══════════════════════════════════════════════════════════════════════════╗
║                    REFACTORING TEST SMELL                                ║
╚══════════════════════════════════════════════════════════════════════════╝

Smell ID:        42
Smell Type:      Anonymous Test
Strategy:        [3] Chain-of-Thought
Model:           [1] Qwen 2.5 Coder 32B
File ID:         15

──────────────────────────────────────────────────────────────────────────
ORIGINAL CODE:
──────────────────────────────────────────────────────────────────────────
it('works', () => {
    const wrapper = mount(BDropdownDivider)
    expect(wrapper.element.tagName).toBe('LI')
    ...
})

──────────────────────────────────────────────────────────────────────────
REFACTORING (please wait)...
──────────────────────────────────────────────────────────────────────────

──────────────────────────────────────────────────────────────────────────
REFACTORED CODE:
──────────────────────────────────────────────────────────────────────────
it('renders dropdown divider as list item with horizontal rule', () => {
    const wrapper = mount(BDropdownDivider)
    expect(wrapper.element.tagName).toBe('LI')
    ...
})

──────────────────────────────────────────────────────────────────────────
✅ REFACTORING COMPLETE
──────────────────────────────────────────────────────────────────────────

Strategy: Chain-of-Thought
Model: Qwen 2.5 Coder 32B
```

## Database Integration

The command fetches smells from the `study_smells` table:

```sql
SELECT id, smell_type, code_snippet, file_id
FROM study_smells
WHERE id = ?
```

### Prerequisites

1. Smell must exist in database
2. Smell must have a `code_snippet` field populated

### Find Available Smells

Use the database module to list smells:

```bash
>>> db list_smells
```

## Adding New Models

To add a new HuggingFace model, edit:

File: `llm-refactor-pipeline/src/llm_refactor/modules/refactor/hf_client.py`

```python
class HuggingFaceModels:
    MODELS: List[Dict[str, str]] = [
        # ... existing models ...
        {
            "id": 7,  # Next available ID
            "name": "Your Model Name",
            "model_id": "namespace/model-name",
            "description": "Model description"
        },
    ]
```

The model will automatically appear in:
- `refactor models` command
- Available for selection via ID
- Help documentation

## Technical Details

### Architecture

```
┌─────────────────┐
│   CLI (REPL)    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  CommandRouter  │
└────────┬────────┘
         │
         ↓
┌─────────────────────────┐
│ RefactorSmellModule     │
│  - Parse arguments      │
│  - Fetch from database  │
│  - Call HF client       │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│ HuggingFaceRefactorClient│
│  - Build prompt         │
│  - Call HF API          │
│  - Return refactored    │
└─────────────────────────┘
```

### Files Structure

```
llm-refactor-pipeline/src/llm_refactor/modules/refactor/
├── __init__.py              # Module exports
├── hf_client.py             # HuggingFace API client
├── refactor_smell.py        # Main refactor module
└── smell_catalog.py         # Smell definitions and examples
```

### API Configuration

- **Base URL**: `https://router.huggingface.co/v1`
- **Authentication**: Bearer token (HF_TOKEN)
- **API**: OpenAI-compatible chat completions
- **Temperature**: 0.6 (configurable)
- **Max Tokens**: 1024 (configurable)

## Troubleshooting

### Error: "HuggingFace API token not found"

**Solution**: Set HF_TOKEN in your `.env` file:
```bash
echo "HF_TOKEN=your_token_here" >> .env
```

### Error: "Smell with ID X not found"

**Solution**: Check available smells:
```bash
>>> db list_smells
```

### Error: "Smell has no code snippet"

**Solution**: The smell in the database doesn't have code. Use a different smell or populate the `code_snippet` field.

### Error: "Invalid strategy or model ID"

**Solution**: Use valid IDs:
- Strategies: 1-3
- Models: 1-6 (or check `refactor models`)

### API Rate Limiting

HuggingFace may rate limit requests. If you encounter this:
- Wait a few minutes between requests
- Upgrade your HuggingFace account
- Use different model providers (IDs 2, 3)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `HF_TOKEN` | ✅ Yes | HuggingFace API token |

## Dependencies

The refactor module requires:
- `openai>=1.0.0` - For HuggingFace API client
- `python-dotenv>=1.0.0` - For .env file loading
- `sqlalchemy>=2.0.0` - For database operations

All are included in the root `requirements.txt`.

## Best Practices

### 1. Start with Chain-of-Thought
CoT (strategy 3) generally produces the best results.

### 2. Use Qwen for Code Tasks
Qwen 2.5 Coder (model 1) is optimized for code generation.

### 3. Validate Results
Always review refactored code before applying it.

### 4. Test Different Strategies
Some smells respond better to different strategies - experiment!

### 5. Check Token Limits
For very large code snippets, the 1024 token limit might be insufficient.

## Future Enhancements

Potential improvements:
- [ ] Save refactored code to database
- [ ] Batch refactoring for multiple smells
- [ ] Custom temperature/max_tokens parameters
- [ ] Comparison mode (show diff)
- [ ] Export to file
- [ ] Integration with experiments table
- [ ] Custom prompt templates
- [ ] Model performance metrics

## Related Commands

- `db list_smells` - List available smells for refactoring
- `db query` - Query database for specific smells
- `ui` - Launch web UI for smell selection
- `detect_smells` - Detect smells in repositories

## Support

For issues or questions:
- Check error messages for specific guidance
- Review `refactor help` for command syntax
- Ensure HF_TOKEN is set correctly
- Verify smell exists in database

---

**Last Updated**: February 16, 2026  
**Version**: 1.0.0  
**Module**: `llm_refactor.modules.refactor`
