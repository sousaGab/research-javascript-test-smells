"""
HuggingFace LLM Client for Test Smell Refactoring.

This module handles communication with HuggingFace's router API
for LLM-based test smell refactoring.
"""

import os
import time
from typing import Optional, Dict, List
from openai import OpenAI

from .code_extractor import extract_code_from_response, CodeExtractionError


class HuggingFaceModels:
    """Available HuggingFace models for refactoring."""
    
    # Model registry with display names and identifiers
    MODELS: List[Dict[str, str]] = [
        {
            "id": 1,
            "name": "Qwen 2.5 Coder 32B",
            "model_id": "Qwen/Qwen2.5-Coder-32B-Instruct",
            "description": "High-quality code generation model",
            "endpoint_url": None  # Uses default HF router
        },
        {
            "id": 2,
            "name": "CodeLlama 34B Instruct",
            "model_id": "meta-llama/CodeLlama-34b-Instruct-hf",
            "description": "CodeLlama model via custom Inference Endpoint",
            "endpoint_url": "https://u1i04a28mj4iv60z.us-east-1.aws.endpoints.huggingface.cloud/v1"
        },
        {
            "id": 3,
            "name": "Llama 3.3 70B Instruct",
            "model_id": "meta-llama/Llama-3.3-70B-Instruct:novita",
            "description": "Meta's Llama 3.3 70B instruction-tuned model",
            "endpoint_url": None  # Uses default HF router
        },
    ]
    
    DEFAULT_MODEL_ID = "Qwen/Qwen2.5-Coder-32B-Instruct"
    
    @classmethod
    def get_model_by_id(cls, model_id: int) -> Optional[Dict]:
        """Get model info by numeric ID."""
        for model in cls.MODELS:
            if model["id"] == model_id:
                return model
        return None
    
    @classmethod
    def get_model_by_name(cls, model_id_str: str) -> Optional[Dict]:
        """Get model info by model_id string."""
        for model in cls.MODELS:
            if model["model_id"] == model_id_str:
                return model
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


def create_zero_shot_prompt(smell_name: str, smell_description: str, test_code: str) -> Dict[str, str]:
    """Creates a zero-shot prompt for test smell refactoring.
    
    Returns:
        Dict with 'system' and 'user' message content
    """
    system_message = "You are a JavaScript test refactoring expert. Follow instructions strictly and output ONLY valid JavaScript code."
    
    user_message = f"""### Your Task

Refactor the test code below to eliminate the test smell.

---

### Context

**Test Smell:** {smell_name}

**Definition:**
{smell_description}

**Original Test Code:**
```javascript
{test_code}
```

---

### Output Requirements

You MUST provide your response in this exact format:

```javascript
// Your COMPLETE refactored test code here
```

**PRIMARY OBJECTIVE:**
- Completely remove the test smell from the code

**CONSTRAINTS (you MUST):**
- Include the COMPLETE test function/method (entire it() or describe() block)
- Preserve semantic behavior and all assertions (you may improve structure)
- Ensure code is syntactically correct and executable

**PROHIBITIONS (you MUST NOT):**
- Output partial code, fragments, or snippets
- Add explanations, descriptions, or commentary
- Include text outside the code block
- Describe what you changed

Provide the complete refactored test code:
"""
    return {"system": system_message, "user": user_message}


def create_few_shot_prompt(smell_name: str, smell_description: str, 
                          test_code: str, examples: List[Dict]) -> Dict[str, str]:
    """Creates a few-shot prompt for test smell refactoring with examples.
    
    Returns:
        Dict with 'system' and 'user' message content
    """
    system_message = "You are a JavaScript test refactoring expert. Follow instructions strictly and output ONLY valid JavaScript code."
    
    # Build examples section dynamically
    examples_section = ""
    if examples:
        valid_examples = []
        for example in examples[:3]:  # Use first 3 examples maximum
            # Validate example has required keys and non-empty values
            if (isinstance(example, dict) and 
                example.get('smelly') and 
                example.get('refactored')):
                valid_examples.append(example)
        
        # Build examples section
        for i, example in enumerate(valid_examples, 1):
            examples_section += f"""### Example {i}
Original (with {smell_name}):
```javascript
{example['smelly']}
```

Refactored (smell removed):
```javascript
{example['refactored']}
```

"""
    
    user_message = f"""### Your Task

Refactor the test code below to eliminate the test smell. Study the examples to understand the refactoring pattern.

---

### Context

**Test Smell:** {smell_name}

**Definition:**
{smell_description}

{examples_section}{("---\n\n" if examples_section else "")}**Original Test Code:**
```javascript
{test_code}
```

---

### Output Requirements

You MUST provide your response in this exact format:

```javascript
// Your COMPLETE refactored test code here
```

**PRIMARY OBJECTIVE:**
- Completely remove the test smell from the code

**CONSTRAINTS (you MUST):**
- Include the COMPLETE test function/method (entire it() or describe() block)
- Preserve semantic behavior and all assertions (you may improve structure)
- Ensure code is syntactically correct and executable

**PROHIBITIONS (you MUST NOT):**
- Output partial code, fragments, or snippets
- Add explanations, descriptions, or commentary
- Include text outside the code block
- Describe what you changed

Provide the complete refactored test code:"""
    return {"system": system_message, "user": user_message}


def create_chain_of_thought_prompt(smell_name: str, smell_description: str,
                                  smell_detection: str, test_code: str,
                                  refactoring_strategies: List[str],
                                  examples: Optional[List[Dict]] = None) -> Dict[str, str]:
    """Creates a chain-of-thought prompt for test smell refactoring.
    
    Returns:
        Dict with 'system' and 'user' message content
    """
    system_message = "You are a JavaScript test refactoring expert. Follow instructions strictly and output ONLY valid JavaScript code."
    
    refactoring_guidance = '\n'.join(f"  {i+1}. {strategy}" for i, strategy in enumerate(refactoring_strategies))
    
    # Build examples section if provided (2 examples maximum for CoT)
    examples_section = ""
    if examples and len(examples) > 0:
        examples_section = "\n### Reference Examples\n\n"
        valid_examples = [ex for ex in examples[:2] if  # Only 2 examples for CoT
                         isinstance(ex, dict) and 
                         ex.get('smelly') and 
                         ex.get('refactored')]
        
        for i, example in enumerate(valid_examples, 1):
            examples_section += f"""#### Example {i}
Original (with {smell_name}):
```javascript
{example.get('smelly', '')}
```

Refactored (smell removed):
```javascript
{example.get('refactored', '')}
```

"""

    user_message = f"""### Your Task

Refactor the test code below to eliminate the test smell.

---

### Context

**Test Smell:** {smell_name}

**Definition:**
{smell_description}

**Detection Criteria:**
{smell_detection}

**Refactoring Strategies:**
Apply these strategies in your solution:
{refactoring_guidance}
{examples_section}
**Original Test Code:**
```javascript
{test_code}
```

---

### Internal Reasoning (Hidden Chain-of-Thought)

You MUST internally reason step by step following this process:

1. **Locate the Smell**: Identify where and how the test smell manifests based on detection criteria
2. **Understand Intent**: Determine what behavior the test verifies and which assertions validate it
3. **Evaluate Impact**: Assess why the current structure violates best practices
4. **Plan Refactoring**: Design a solution using the strategies provided above
5. **Validate**: Ensure the refactored version meets all requirements

**CRITICAL:** DO NOT reveal your reasoning. ONLY output the final refactored code.

---

### Output Requirements

You MUST provide your response in this exact format:

```javascript
// Your COMPLETE refactored test code here
```

**PRIMARY OBJECTIVE:**
- Completely remove the test smell using the strategies provided

**CONSTRAINTS (you MUST):**
- Include the COMPLETE test function/method (entire it() or describe() block)
- Preserve semantic behavior and all assertions (you may improve structure)
- Ensure code is syntactically correct and executable

**PROHIBITIONS (you MUST NOT):**
- Output only fragments, snippets, or parts of the code
- Include explanations or commentary about your reasoning
- Describe what you changed
- Provide code outside the markdown code block

Provide your response:"""
    return {"system": system_message, "user": user_message}


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
        
        # Client will be created per-request based on model endpoint
        self.default_base_url = "https://router.huggingface.co/v1"
    
    def refactor(
        self,
        smell_name: str,
        smell_description: str,
        test_code: str,
        prompt_strategy: str = PromptStrategy.CHAIN_OF_THOUGHT,
        model: str = HuggingFaceModels.DEFAULT_MODEL_ID,
        examples: Optional[List[Dict]] = None,
        refactoring_strategies: Optional[List[str]] = None,
        smell_detection: str = "",
        temperature: float = 0.3,
        top_p: float = 0.7,
        max_tokens: int = 4096,
    ) -> Dict[str, any]:
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
            smell_detection: Detection criteria description for CoT (optional)
            temperature: Sampling temperature (0.0 to 2.0)
            top_p: Nucleus sampling parameter (must be > 0.0 and < 1.0)
            max_tokens: Maximum tokens to generate
        
        Returns:
            Dict with:
                - code: Refactored test code (str)
                - tokens: Total tokens used (int) - prompt + completion
                - latency: API response time in seconds (float)
        """
        # Create prompt based on strategy
        if prompt_strategy == PromptStrategy.ZERO_SHOT:
            prompt_dict = create_zero_shot_prompt(smell_name, smell_description, test_code)
        elif prompt_strategy == PromptStrategy.FEW_SHOT:
            if not examples:
                examples = []
            prompt_dict = create_few_shot_prompt(smell_name, smell_description, test_code, examples)
        elif prompt_strategy == PromptStrategy.CHAIN_OF_THOUGHT:
            if not refactoring_strategies:
                refactoring_strategies = []
            if not examples:
                examples = []
            prompt_dict = create_chain_of_thought_prompt(
                smell_name, smell_description, smell_detection, test_code, refactoring_strategies, examples
            )
        else:
            raise ValueError(f"Unknown prompt strategy: {prompt_strategy}")
        
        try:
            # Determine endpoint URL based on model
            base_url = self.default_base_url
            model_info = HuggingFaceModels.get_model_by_name(model)
            
            # For custom Inference Endpoints, use the endpoint URL
            # TGI endpoints ignore the model parameter (model is fixed on the endpoint)
            # but we need to pass something - using the model_id from our registry
            if model_info and model_info.get("endpoint_url"):
                base_url = model_info["endpoint_url"]
                model_param = model_info.get("model_id", "tgi")
            else:
                model_param = model  # Use full model path for router
            
            # Create client with appropriate endpoint
            client = OpenAI(
                base_url=base_url,
                api_key=self.api_key,
            )
            
            # Call HuggingFace API with system and user roles
            messages = [
                {"role": "system", "content": prompt_dict["system"]},
                {"role": "user", "content": prompt_dict["user"]}
            ]
            
            # Measure API latency
            start_time = time.time()
            
            response = client.chat.completions.create(
                model=model_param,
                messages=messages,
                temperature=temperature,
                top_p=top_p,
                max_tokens=max_tokens
            )
            
            latency = time.time() - start_time
            
            raw_output = response.choices[0].message.content.strip()
            
            # Extract code from response (remove markdown formatting and explanations)
            try:
                code = extract_code_from_response(raw_output)
            except CodeExtractionError as e:
                raise RuntimeError(f"Failed to extract valid JavaScript code from model output: {e}") from e
            
            # Extract token usage (if available)
            tokens = 0
            if hasattr(response, 'usage') and response.usage:
                tokens = getattr(response.usage, 'total_tokens', 0)
            
            return {
                'code': code,
                'tokens': tokens,
                'latency': latency
            }
            
        except Exception as e:
            raise RuntimeError(f"HuggingFace API call failed: {e}")