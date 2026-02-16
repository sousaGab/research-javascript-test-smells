"""
HuggingFace LLM Client for Test Smell Refactoring.

This module handles communication with HuggingFace's router API
for LLM-based test smell refactoring.
"""

import os
from typing import Optional, Dict, List
from openai import OpenAI


class HuggingFaceModels:
    """Available HuggingFace models for refactoring."""
    
    # Model registry with display names and identifiers
    MODELS: List[Dict[str, str]] = [
        {
            "id": 1,
            "name": "Qwen 2.5 Coder 32B",
            "model_id": "Qwen/Qwen2.5-Coder-32B-Instruct",
            "description": "High-quality code generation model (default)"
        },
        {
            "id": 2,
            "name": "Qwen 2.5 Coder 32B (Together)",
            "model_id": "Qwen/Qwen2.5-Coder-32B-Instruct:together",
            "description": "Qwen via Together AI provider"
        },
        {
            "id": 3,
            "name": "Qwen 2.5 Coder 32B (DeepInfra)",
            "model_id": "Qwen/Qwen2.5-Coder-32B-Instruct:deepinfra",
            "description": "Qwen via DeepInfra provider"
        },
        {
            "id": 4,
            "name": "DeepSeek R1",
            "model_id": "deepseek-ai/DeepSeek-R1:novita",
            "description": "DeepSeek R1 via Novita provider"
        },
        {
            "id": 5,
            "name": "DeepSeek R1 Distill Qwen 32B",
            "model_id": "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B:novita",
            "description": "Distilled DeepSeek R1 model"
        },
        {
            "id": 6,
            "name": "Llama 3.1 70B",
            "model_id": "meta-llama/Llama-3.1-70B-Instruct",
            "description": "Meta Llama 3.1 70B parameter model"
        },
    ]
    
    DEFAULT_MODEL_ID = "Qwen/Qwen2.5-Coder-32B-Instruct"
    
    @classmethod
    def get_model_by_id(cls, model_id: int) -> Optional[str]:
        """Get model identifier by numeric ID."""
        for model in cls.MODELS:
            if model["id"] == model_id:
                return model["model_id"]
        return None
    
    @classmethod
    def get_model_by_name(cls, model_id_str: str) -> Optional[str]:
        """Get model by model_id string."""
        for model in cls.MODELS:
            if model["model_id"] == model_id_str:
                return model["model_id"]
        return None
    
    @classmethod
    def list_models(cls) -> str:
        """Return formatted list of available models."""
        lines = ["Available HuggingFace Models:", ""]
        for model in cls.MODELS:
            default = " (DEFAULT)" if model["model_id"] == cls.DEFAULT_MODEL_ID else ""
            lines.append(f"  [{model['id']}] {model['name']}{default}")
            lines.append(f"      {model['description']}")
            lines.append(f"      Model ID: {model['model_id']}")
            lines.append("")
        return "\n".join(lines)


class PromptStrategy:
    """Prompt strategy definitions."""
    
    ZERO_SHOT = "zero_shot"
    FEW_SHOT = "few_shot"
    CHAIN_OF_THOUGHT = "cot"
    
    STRATEGIES = {
        1: (ZERO_SHOT, "Zero-Shot", "Direct refactoring without examples"),
        2: (FEW_SHOT, "Few-Shot", "Refactoring with example demonstrations"),
        3: (CHAIN_OF_THOUGHT, "Chain-of-Thought", "Step-by-step reasoning approach"),
    }
    
    @classmethod
    def get_strategy(cls, strategy_id: int) -> Optional[str]:
        """Get strategy key by numeric ID."""
        if strategy_id in cls.STRATEGIES:
            return cls.STRATEGIES[strategy_id][0]
        return None
    
    @classmethod
    def list_strategies(cls) -> str:
        """Return formatted list of available strategies."""
        lines = ["Available Prompt Strategies:", ""]
        for sid, (key, name, desc) in cls.STRATEGIES.items():
            lines.append(f"  [{sid}] {name}")
            lines.append(f"      {desc}")
            lines.append("")
        return "\n".join(lines)


def create_zero_shot_prompt(smell_name: str, smell_description: str, test_code: str) -> str:
    """Creates a zero-shot prompt for test smell refactoring."""
    prompt = f"""You are a senior software engineer and researcher specializing in JavaScript test quality.

Your task is to refactor the test code below to REMOVE the specified test smell,
while strictly preserving the original test behavior.

Constraints:
- Output ONLY the refactored JavaScript test code.
- Do NOT add explanations, comments, or metadata.
- Follow JavaScript testing best practices (e.g., Jest/Mocha/Chai).
- Ensure the specified test smell is fully removed.

### Test Smell
{smell_name}

### Test Smell Definition
{smell_description}

### Original Test Code
```javascript
{test_code}
```
"""
    return prompt


def create_few_shot_prompt(smell_name: str, smell_description: str, 
                          test_code: str, examples: List[Dict]) -> str:
    """Creates a few-shot prompt for test smell refactoring with examples."""
    
    # Get first two examples if available
    example_1 = examples[0] if len(examples) > 0 else {'smelly': '', 'refactored': ''}
    example_2 = examples[1] if len(examples) > 1 else {'smelly': '', 'refactored': ''}
    
    prompt = f"""You are a senior software engineer and researcher specializing in JavaScript test smell refactoring.

Your task is to refactor a JavaScript test to REMOVE a specific test smell.
You must preserve test semantics and improve test quality.

Constraints:
- Output ONLY the refactored JavaScript test code.
- Do NOT explain the changes.
- Ensure the test smell is removed.

Test Smell: {smell_name}

### Example 1
Original:
```javascript
{example_1['smelly']}
```

Refactored:
```javascript
{example_1['refactored']}
```

### Example 2
Original:
```javascript
{example_2['smelly']}
```

Refactored:
```javascript
{example_2['refactored']}
```

---

### Task

Test Smell Definition:

{smell_description}

Original Test Code:
```javascript
{test_code}
```
"""
    return prompt


def create_chain_of_thought_prompt(smell_name: str, smell_description: str,
                                  test_code: str, refactoring_strategies: List[str]) -> str:
    """Creates a chain-of-thought prompt for test smell refactoring."""
    
    refactoring_guidance = '\n'.join(f"- {strategy}" for strategy in refactoring_strategies)

    prompt = f"""You are a senior software engineer and researcher specializing in automated test quality and test smell refactoring in JavaScript test suites.

Your task is to refactor the test code below to REMOVE a specific test smell.

You MUST follow a rigorous, step-by-step internal reasoning process to ensure correctness and quality.
However, you MUST NOT reveal, explain, summarize, or reference your reasoning in the output.

────────────────────────────────────────
INTERNAL REASONING PROCESS (DO NOT OUTPUT):
1. Identify the exact manifestation of the specified test smell in the code.
2. Infer the true intent of the test and what behavior it is meant to verify.
3. Evaluate why the current construct is suboptimal with respect to clarity, expressiveness, or diagnostics.
4. Design a refactoring strategy that removes the smell while preserving semantics.
5. Apply the refactoring.
6. Validate internally that:
   - Test behavior is preserved
   - The smell is removed
   - The test follows JavaScript testing best practices
────────────────────────────────────────

Output:
Provide only the refactored JavaScript test code:
```javascript
// Refactored code here
```

### Test Smell
{smell_name}

### Test Smell Definition
{smell_description}

### Refactoring Guidance
{refactoring_guidance}

### Original Test Code
```javascript
{test_code}
```
"""
    return prompt


class HuggingFaceRefactorClient:
    """Client for HuggingFace-based test smell refactoring."""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize HuggingFace client.
        
        Args:
            api_key: HuggingFace API token (defaults to HF_TOKEN env var)
        """
        self.api_key = api_key or os.getenv("HF_TOKEN")
        if not self.api_key:
            raise ValueError(
                "HuggingFace API token not found. "
                "Set HF_TOKEN environment variable or pass api_key parameter."
            )
        
        self.client = OpenAI(
            base_url="https://router.huggingface.co/v1",
            api_key=self.api_key,
        )
    
    def refactor(
        self,
        smell_name: str,
        smell_description: str,
        test_code: str,
        prompt_strategy: str = PromptStrategy.CHAIN_OF_THOUGHT,
        model: str = HuggingFaceModels.DEFAULT_MODEL_ID,
        examples: Optional[List[Dict]] = None,
        refactoring_strategies: Optional[List[str]] = None,
        temperature: float = 0.6,
        max_tokens: int = 1024,
    ) -> str:
        """
        Refactor test smell using HuggingFace LLM.
        
        Args:
            smell_name: Name of the test smell
            smell_description: Description of the test smell
            test_code: Original test code with the smell
            prompt_strategy: Prompting strategy (zero_shot, few_shot, cot)
            model: HuggingFace model identifier
            examples: List of example dicts for few-shot (optional)
            refactoring_strategies: List of refactoring strategies for CoT (optional)
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
        
        Returns:
            Refactored test code
        """
        # Create prompt based on strategy
        if prompt_strategy == PromptStrategy.ZERO_SHOT:
            prompt = create_zero_shot_prompt(smell_name, smell_description, test_code)
        elif prompt_strategy == PromptStrategy.FEW_SHOT:
            if not examples:
                examples = []
            prompt = create_few_shot_prompt(smell_name, smell_description, test_code, examples)
        elif prompt_strategy == PromptStrategy.CHAIN_OF_THOUGHT:
            if not refactoring_strategies:
                refactoring_strategies = []
            prompt = create_chain_of_thought_prompt(
                smell_name, smell_description, test_code, refactoring_strategies
            )
        else:
            raise ValueError(f"Unknown prompt strategy: {prompt_strategy}")
        
        try:
            # Call HuggingFace API
            messages = [{"role": "user", "content": prompt}]
            
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            
            output = response.choices[0].message.content.strip()
            return output
            
        except Exception as e:
            raise RuntimeError(f"HuggingFace API call failed: {e}")
