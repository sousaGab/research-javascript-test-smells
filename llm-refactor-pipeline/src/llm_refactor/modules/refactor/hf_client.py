"""
Multi-Provider LLM Client for Test Smell Refactoring.

This module handles communication with multiple LLM providers
(HuggingFace Router, OpenAI, Anthropic) for LLM-based test smell refactoring.

Architecture:
- BaseLLMClient: Abstract interface for all providers
- OpenAICompatibleClient: HF Router, OpenAI, Together, Fireworks, Novita
- AnthropicClient: Official Anthropic API (non-OpenAI compatible)
- LLMClientFactory: Provider resolution and client instantiation
"""
import requests
import os
import time
from abc import ABC, abstractmethod
from typing import Optional, Dict, List

from openai import OpenAI

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

try:
    from google import genai
    from google.genai import types as genai_types
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False

from .code_extractor import extract_code_from_response, CodeExtractionError


# =============================================================================
# LLM Provider Clients (Strategy Pattern)
# =============================================================================

class BaseLLMClient(ABC):
    """Abstract base class for LLM providers.
    
    Implements Strategy pattern to isolate provider-specific API differences.
    """

    def __init__(self, api_key: Optional[str], base_url: str):
        self.api_key = api_key
        self.base_url = base_url

    @abstractmethod
    def generate(
        self,
        model: str,
        system_prompt: str,
        user_prompt: str,
        temperature: float,
        top_p: float,
        max_tokens: int
    ) -> Dict:
        """Generate completion from LLM.
        
        Args:
            model: Model identifier
            system_prompt: System message content
            user_prompt: User message content
            temperature: Sampling temperature
            top_p: Nucleus sampling parameter
            max_tokens: Maximum tokens to generate
            
        Returns:
            Dict with 'content', 'tokens', 'latency'
        """
        ...

class TGIClient(BaseLLMClient):
    """
    Client for HuggingFace Text Generation Inference (TGI)
    Used by RunPod DeepSeek Coder template and other TGI endpoints.
    """

    def generate(
        self,
        model: str,
        system_prompt: str,
        user_prompt: str,
        temperature: float,
        top_p: float,
        max_tokens: int
    ) -> Dict:

        start_time = time.time()

        # DeepSeek Coder chat format (based on apply_chat_template)
        # Combines system and user messages, then expects model to generate as Assistant
        combined_message = f"{system_prompt}\n\n{user_prompt}" if system_prompt else user_prompt
        full_prompt = f"{combined_message}\n"

        url = f"{self.base_url}/generate"

        payload = {
            "inputs": full_prompt,
            "parameters": {
                "max_new_tokens": max_tokens,
                "temperature": temperature if temperature > 0 else 0.01,  # TGI requires temp > 0
                "top_p": top_p,
                "do_sample": True,
                "stop": ["<|EOT|>"],  # DeepSeek end-of-turn token
                "repetition_penalty": 1.0,
            }
        }

        headers = {
            "Content-Type": "application/json"
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=300)
            response.raise_for_status()
        except requests.exceptions.Timeout:
            raise RuntimeError(f"TGI endpoint timeout after 300 seconds: {url}")
        except requests.exceptions.ConnectionError as e:
            raise RuntimeError(f"Failed to connect to TGI endpoint {url}: {e}")
        except requests.exceptions.HTTPError as e:
            raise RuntimeError(f"TGI endpoint returned error: {e}. Response: {response.text if response else 'N/A'}")

        latency = time.time() - start_time

        try:
            result = response.json()
        except Exception as e:
            raise RuntimeError(f"Failed to parse TGI response as JSON: {e}. Response: {response.text}")

        content = result.get("generated_text", "").strip()
        
        if not content:
            raise RuntimeError(f"TGI returned empty generated_text. Response: {result}")

        return {
            "content": content,
            "tokens": 0,   # TGI doesn't return usage by default
            "latency": latency
        }

class OpenAICompatibleClient(BaseLLMClient):
    """
    Client for OpenAI-compatible APIs.

    Supports:
    - OpenAI GPT-5.x (via Responses API)
    - HuggingFace Router
    - Together AI
    - Fireworks AI
    - Novita AI
    - Any OpenAI-compatible endpoint
    """

    def generate(
        self,
        model: str,
        system_prompt: str,
        user_prompt: str,
        temperature: float,
        top_p: float,
        max_tokens: Optional[int] = None
    ) -> Dict:

        client = OpenAI(
            api_key=self.api_key,
            base_url=self.base_url,
        )

        model_lower = model.lower().strip()
        start_time = time.time()

        # ==============================================================
        # GPT-5.x → MUST use Responses API
        # ==============================================================

        if model_lower.startswith("gpt-5"):
            response = client.responses.create(
                model=model,
                input=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=temperature,
                top_p=top_p,
                max_output_tokens=max_tokens,
            )

            latency = time.time() - start_time

            # -------- Extract text safely --------
            content = ""

            # Preferred accessor
            if hasattr(response, "output_text") and response.output_text:
                content = response.output_text
            # Fallback (structured output format)
            elif hasattr(response, "output") and response.output:
                try:
                    content = response.output[0].content[0].text
                except Exception:
                    content = ""

            # -------- Token usage --------
            tokens = 0
            if hasattr(response, "usage") and response.usage:
                tokens = getattr(response.usage, "total_tokens", 0)

            return {
                "content": content.strip(),
                "tokens": tokens,
                "latency": latency
            }

        # ==============================================================
        # All other models → Chat Completions API
        # ==============================================================

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        # Build API parameters
        api_params = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "top_p": top_p,
        }
        # Only add max_tokens if specified (let API auto-calculate otherwise)
        if max_tokens is not None:
            api_params["max_tokens"] = max_tokens

        response = client.chat.completions.create(**api_params)

        latency = time.time() - start_time

        tokens = 0
        if hasattr(response, "usage") and response.usage:
            tokens = getattr(response.usage, "total_tokens", 0)

        return {
            "content": response.choices[0].message.content.strip(),
            "tokens": tokens,
            "latency": latency
        }

class AnthropicClient(BaseLLMClient):
    """Client for Anthropic's official API.
    
    Uses the official Anthropic SDK as Anthropic's API is NOT OpenAI-compatible.
    Key differences:
    - Uses /v1/messages endpoint (not /chat/completions)
    - System prompt is a separate parameter (not a message role)
    - Requires anthropic-version header
    - Different response structure
    """

    def __init__(self, api_key: str, base_url: str = None):
        super().__init__(api_key, base_url)
        if not ANTHROPIC_AVAILABLE:
            raise ImportError(
                "Anthropic SDK not installed. Install with: pip install anthropic"
            )

    def generate(
        self,
        model: str,
        system_prompt: str,
        user_prompt: str,
        temperature: float,
        top_p: float,
        max_tokens: int
    ) -> Dict:
        
        client = anthropic.Anthropic(api_key=self.api_key)

        start_time = time.time()

        # Anthropic does not allow both temperature and top_p simultaneously.
        # Per docs: "You should either alter temperature or top_p, but not both."
        # We use temperature only (recommended for most use cases).
        response = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_prompt,
            messages=[
                {"role": "user", "content": user_prompt}
            ]
        )

        latency = time.time() - start_time

        # Anthropic returns usage differently
        tokens = 0
        if hasattr(response, 'usage') and response.usage:
            input_tokens = getattr(response.usage, 'input_tokens', 0)
            output_tokens = getattr(response.usage, 'output_tokens', 0)
            tokens = input_tokens + output_tokens

        return {
            "content": response.content[0].text.strip(),
            "tokens": tokens,
            "latency": latency
        }


class GoogleClient(BaseLLMClient):
    """Client for Google's Generative AI API (Gemini models).
    
    Uses the official Google Genai SDK as Google's API is NOT OpenAI-compatible.
    Key differences:
    - Uses /v1beta/models/{model}:generateContent endpoint
    - Different request structure with contents and parts
    - Config is separate from messages (GenerateContentConfig)
    - Requires x-goog-api-key header
    - Each request is independent (no conversation context carried over)
    """

    def __init__(self, api_key: str, base_url: str = None):
        super().__init__(api_key, base_url)
        if not GOOGLE_AVAILABLE:
            raise ImportError(
                "Google Genai SDK not installed. Install with: pip install google-genai"
            )

    def generate(
        self,
        model: str,
        system_prompt: str,
        user_prompt: str,
        temperature: float,
        top_p: float,
        max_tokens: int
    ) -> Dict:
        """
        Generate content using Gemini API with retry logic.
        
        Each call creates a completely NEW client instance - no conversation history.
        Retries up to 3 times if response is empty.
        """
        
        max_retries = 3
        last_error = None
        
        for attempt in range(1, max_retries + 1):
            try:
                # Create FRESH client for THIS request only (no history)
                client = genai.Client(api_key=self.api_key)

                start_time = time.time()

                # Generate content with proper system instruction
                # Gemini uses system_instruction parameter in config (not combined prompts)
                # Limit thinking budget to prevent overthinking
                response = client.models.generate_content(
                    model=model,
                    contents=user_prompt,
                    config=genai_types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        temperature=temperature,
                        top_p=top_p
                    )
                )

                latency = time.time() - start_time

                # Extract text content safely, filtering out thought parts
                content = ""
                finish_reason = None
                empty_reason = None  # Track why content was empty for debugging
                
                try:
                    if hasattr(response, 'text') and response.text:
                        # Simple text response (no structured parts)
                        content = response.text.strip()
                    elif hasattr(response, 'candidates') and response.candidates:
                        candidate = response.candidates[0]
                        finish_reason = getattr(candidate, 'finish_reason', None)
                        
                        if hasattr(candidate, 'content') and candidate.content:
                            if hasattr(candidate.content, 'parts') and candidate.content.parts:
                                # Extract text from all non-thought parts
                                # Gemini may return multiple parts: some with thought=true (reasoning), 
                                # some without (actual answer). We only want the non-thought parts.
                                text_parts = []
                                total_parts = len(candidate.content.parts)
                                thought_parts_count = 0
                                
                                for part in candidate.content.parts:
                                    # Skip thought parts (internal reasoning)
                                    is_thought = getattr(part, 'thought', False)
                                    if is_thought:
                                        thought_parts_count += 1
                                        continue
                                    # Append non-thought text
                                    if hasattr(part, 'text') and part.text:
                                        text_parts.append(part.text)
                                
                                # Combine all non-thought text parts
                                content = ''.join(text_parts).strip()
                                
                                # Track why content might be empty
                                if not content:
                                    if total_parts == thought_parts_count:
                                        empty_reason = f"all {total_parts} parts were thoughts"
                                    elif not text_parts:
                                        empty_reason = f"{total_parts} parts but none had text"
                                    else:
                                        empty_reason = "text parts were empty strings"
                            else:
                                empty_reason = "no parts in content"
                        else:
                            empty_reason = "no content in candidate"
                    else:
                        empty_reason = "no candidates in response"
                except (AttributeError, IndexError, TypeError) as e:
                    empty_reason = f"exception during extraction: {e}"

                # Check for empty responses and retry
                if not content:
                    if attempt < max_retries:
                        # Empty response - retry with fresh client
                        reason_msg = f" ({empty_reason})" if empty_reason else ""
                        print(f"   ⚠ Gemini returned empty response{reason_msg} (attempt {attempt}/{max_retries}), retrying...")
                        time.sleep(2)  # Brief delay before retry
                        continue
                    else:
                        reason_msg = f" Reason: {empty_reason}." if empty_reason else ""
                        raise RuntimeError(
                            f"Gemini returned no content after {max_retries} attempts. "
                            f"Finish reason: {finish_reason or 'unknown'}.{reason_msg}"
                        )

                # Extract token usage safely (handle None values)
                tokens = 0
                if hasattr(response, 'usage_metadata') and response.usage_metadata:
                    # Use total_token_count if available
                    total = getattr(response.usage_metadata, 'total_token_count', None)
                    if total is not None and total > 0:
                        tokens = total
                    else:
                        # Fallback: sum prompt and candidate tokens (handle None)
                        prompt_tokens = getattr(response.usage_metadata, 'prompt_token_count', 0) or 0
                        candidate_tokens = getattr(response.usage_metadata, 'candidates_token_count', 0) or 0
                        tokens = prompt_tokens + candidate_tokens

                return {
                    "content": content,
                    "tokens": tokens,
                    "latency": latency
                }
                
            except RuntimeError:
                # Re-raise RuntimeError (MAX_TOKENS, empty response)
                raise
            except Exception as e:
                last_error = e
                if attempt < max_retries:
                    print(f"   ⚠ Gemini API error (attempt {attempt}/{max_retries}): {e}. Retrying...")
                    time.sleep(2)
                    continue
                else:
                    raise RuntimeError(f"Gemini API failed after {max_retries} attempts: {e}")
        
        # Should never reach here, but just in case
        raise RuntimeError(f"Gemini generation failed: {last_error}")


# =============================================================================
# Provider Definitions
# =============================================================================

class LLMProvider:
    """Supported LLM providers."""
    HUGGINGFACE = "huggingface"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    TGI = "tgi" 


class HuggingFaceModels:
    """Available models for refactoring across different providers."""
    
    # Model registry with display names and identifiers
    MODELS: List[Dict[str, str]] = [
        {
            "id": 1,
            "name": "Qwen 2.5 Coder 32B",
            "model_id": "Qwen/Qwen2.5-Coder-32B-Instruct",
            "description": "High-quality code generation model",
            "endpoint_url": None, # Uses default HF router
            "provider": LLMProvider.HUGGINGFACE,
            "api_key_env": "HF_TOKEN"
        },
        {
            "id": 2,
            "name": "CodeLlama 34B",
            "model_id": "meta-llama/CodeLlama-34b-Instruct-hf",
            "description": "CodeLlama model via custom Inference Endpoint",
            "endpoint_url": "https://u1i04a28mj4iv60z.us-east-1.aws.endpoints.huggingface.cloud/v1",
            "provider": LLMProvider.HUGGINGFACE,
            "api_key_env": "HF_TOKEN"
        },
        {
            "id": 3,
            "name": "Claude Sonnet 4.6",
            "model_id": "claude-sonnet-4-6",
            "description": "Anthropic's Claude Sonnet 4.6 - balanced speed and intelligence (Feb 2026)",
            "endpoint_url": "https://api.anthropic.com/v1",
            "provider": LLMProvider.ANTHROPIC,
            "api_key_env": "CLAUDE_TOKEN"
        },
        {
            "id": 4,
            "name": "GPT-5.2",
            "model_id": "gpt-5.2",
            "description": "OpenAI's GPT-5.2 model",
            "endpoint_url": "https://api.openai.com/v1",
            "provider": LLMProvider.OPENAI,
            "api_key_env": "GPT_TOKEN"
        },
        {
            "id": 5,
            "name": "DeepSeek-V3.2",
            "model_id": "deepseek-ai/DeepSeek-V3.2",
            "description": "DeepSeek-V3.2",
            "endpoint_url": None, # Uses default HF router
            "provider": LLMProvider.HUGGINGFACE,
            "api_key_env": "HF_TOKEN"
        },
        {
            "id": 6,
            "name": "Gemini 2.5 Pro",
            "model_id": "gemini-2.5-pro",
            "description": "Google DeepMind's Gemini 2.5 Pro - advanced reasoning, improved coding, and long-context performance",
            "endpoint_url": "https://generativelanguage.googleapis.com/v1",
            "provider": LLMProvider.GOOGLE,
            "api_key_env": "GOOGLE_TOKEN"
        },
        {
            "id": 7,
            "name": "GPT-5.1",
            "model_id": "gpt-5.1",
            "description": "OpenAI's GPT-5.1 model",
            "endpoint_url": "https://api.openai.com/v1",
            "provider": LLMProvider.OPENAI,
            "api_key_env": "GPT_TOKEN"
        },
        {
            "id": 8,
            "name": "CodeLlama-70b",
            "model_id": "codellama/CodeLlama-70b-Instruct-hf",
            "description": "CodeLlama 70B model via vLLM Engine (OpenAI-compatible)",
            "endpoint_url": "https://gz8jg96kxwjwh0eh.us-east-1.aws.endpoints.huggingface.cloud/v1",
            "provider": LLMProvider.HUGGINGFACE,
            "api_key_env": "HF_TOKEN",
            "skip_max_tokens": True  # Let API auto-calculate based on available context
        }
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
        lines = ["Available LLM Models:", ""]
        for model in cls.MODELS:
            default = " (DEFAULT)" if model["model_id"] == cls.DEFAULT_MODEL_ID else ""
            provider = model.get("provider", LLMProvider.HUGGINGFACE).upper()
            lines.append(f"  [{model['id']}] {model['name']} [{provider}]{default}")
            lines.append(f"      {model['description']}")
            lines.append(f"      Model ID: {model['model_id']}")
            lines.append("")
        return "\n".join(lines)


# =============================================================================
# Client Factory (Strategy Pattern Resolution)
# =============================================================================

class LLMClientFactory:
    """Factory for creating provider-specific LLM clients.
    
    Implements Factory pattern to isolate client instantiation logic
    and ensure correct client is used for each provider.
    """
    
    @staticmethod
    def create(provider: str, api_key: str, base_url: str) -> BaseLLMClient:
        """Create appropriate LLM client based on provider.
        
        Args:
            provider: Provider identifier (LLMProvider constant)
            api_key: API key for the provider
            base_url: Base URL for the API endpoint
            
        Returns:
            BaseLLMClient instance appropriate for the provider
            
        Raises:
            ValueError: If provider is not supported
        """
        if provider == LLMProvider.ANTHROPIC:
            return AnthropicClient(api_key=api_key, base_url=base_url)
        
        if provider == LLMProvider.GOOGLE:
            return GoogleClient(api_key=api_key, base_url=base_url)
        
        if provider == LLMProvider.TGI:
            # RunPod TGI uses native /generate endpoint
            return TGIClient(api_key=None, base_url=base_url)
        
        # OpenAI, HuggingFace, and other OpenAI-compatible providers
        return OpenAICompatibleClient(api_key=api_key, base_url=base_url)


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
        for sid, (_key, name, desc) in cls.STRATEGIES.items():
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
    """Client for multi-provider LLM-based test smell refactoring.
    
    This client provides a unified interface for refactoring test smells
    using multiple LLM providers. It automatically selects the correct
    client implementation based on the provider type.
    
    Supported providers:
    - HuggingFace Router (OpenAI-compatible)
    - OpenAI (GPT models)
    - Anthropic (Claude models) - uses native Anthropic SDK
    - Together, Fireworks, Novita (OpenAI-compatible)
    """
    
    # Default endpoint URLs per provider
    PROVIDER_ENDPOINTS = {
        LLMProvider.HUGGINGFACE: "https://router.huggingface.co/v1",
        LLMProvider.OPENAI: "https://api.openai.com/v1",
        LLMProvider.ANTHROPIC: "https://api.anthropic.com/v1",
        LLMProvider.GOOGLE: "https://generativelanguage.googleapis.com/v1",
    }
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize LLM client.
        
        Args:
            api_key: Default API token (defaults to HF_TOKEN env var).
                     Provider-specific tokens are loaded automatically from env vars.
        """
        # Store default API key (for backward compatibility)
        self.api_key = api_key or os.getenv("HF_TOKEN")
        
        # Cache for API keys per provider
        self._api_keys: Dict[str, str] = {}
        
        # Client will be created per-request based on model endpoint
        self.default_base_url = "https://router.huggingface.co/v1"
    
    def _get_api_key(self, model_info: Optional[Dict]) -> Optional[str]:
        """Get the appropriate API key for the given model.
        
        Args:
            model_info: Model configuration dict from HuggingFaceModels.MODELS
            
        Returns:
            API key string for the model's provider, or None for local endpoints (e.g., TGI)
            
        Raises:
            ValueError: If no API key is found for the provider (when required)
        """
        if not model_info:
            # Fallback to default HF key
            if not self.api_key:
                raise ValueError(
                    "HuggingFace API token not found. "
                    "Set HF_TOKEN environment variable or pass api_key parameter."
                )
            return self.api_key
        
        # Get env var name for this model's API key
        api_key_env = model_info.get("api_key_env", "HF_TOKEN")
        provider = model_info.get("provider", LLMProvider.HUGGINGFACE)
        
        # TGI and other local endpoints don't require API keys
        if api_key_env is None:
            return None
        
        # Check cache first
        if api_key_env in self._api_keys:
            return self._api_keys[api_key_env]
        
        # Load from environment
        api_key = os.getenv(api_key_env)
        if not api_key:
            raise ValueError(
                f"API token for {provider} not found. "
                f"Set {api_key_env} environment variable."
            )
        
        # Cache and return
        self._api_keys[api_key_env] = api_key
        return api_key
    
    def _build_prompt(
        self,
        smell_name: str,
        smell_description: str,
        test_code: str,
        prompt_strategy: str,
        examples: Optional[List[Dict]] = None,
        refactoring_strategies: Optional[List[str]] = None,
        smell_detection: str = "",
    ) -> Dict[str, str]:
        """Build prompt dict based on strategy.
        
        Args:
            smell_name: Name of the test smell
            smell_description: Description of the test smell
            test_code: Original test code with the smell
            prompt_strategy: Prompting strategy (zero_shot, few_shot, cot)
            examples: List of example dicts for few-shot (optional)
            refactoring_strategies: List of refactoring strategies for CoT (optional)
            smell_detection: Detection criteria description for CoT (optional)
            
        Returns:
            Dict with 'system' and 'user' message content
        """
        if prompt_strategy == PromptStrategy.ZERO_SHOT:
            return create_zero_shot_prompt(smell_name, smell_description, test_code)
        elif prompt_strategy == PromptStrategy.FEW_SHOT:
            return create_few_shot_prompt(
                smell_name, smell_description, test_code, examples or []
            )
        elif prompt_strategy == PromptStrategy.CHAIN_OF_THOUGHT:
            return create_chain_of_thought_prompt(
                smell_name, smell_description, smell_detection, 
                test_code, refactoring_strategies or [], examples or []
            )
        else:
            raise ValueError(f"Unknown prompt strategy: {prompt_strategy}")
    
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
        Refactor test smell using LLM (multi-provider support).
        
        This method automatically selects the correct client implementation
        based on the model's provider (Anthropic vs OpenAI-compatible).
        
        Args:
            smell_name: Name of the test smell
            smell_description: Description of the test smell
            test_code: Original test code with the smell
            prompt_strategy: Prompting strategy (zero_shot, few_shot, cot)
            model: Model identifier (from HuggingFaceModels.MODELS)
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
        # Build prompt based on strategy
        prompt_dict = self._build_prompt(
            smell_name=smell_name,
            smell_description=smell_description,
            test_code=test_code,
            prompt_strategy=prompt_strategy,
            examples=examples,
            refactoring_strategies=refactoring_strategies,
            smell_detection=smell_detection,
        )
        
        # Resolve model configuration
        model_info = HuggingFaceModels.get_model_by_name(model)
        
        # Get provider-specific settings
        provider = model_info.get("provider", LLMProvider.HUGGINGFACE) if model_info else LLMProvider.HUGGINGFACE
        api_key = self._get_api_key(model_info)
        
        # Determine base URL
        if model_info and model_info.get("endpoint_url"):
            base_url = model_info["endpoint_url"]
        else:
            base_url = self.PROVIDER_ENDPOINTS.get(provider, self.default_base_url)
        
        # Determine model parameter to send to API
        model_param = model_info.get("model_id", model) if model_info else model
        
        # Check if model wants to skip max_tokens (for dynamic context calculation)
        tokens_to_use = None if (model_info and model_info.get("skip_max_tokens", False)) else max_tokens
        
        import time
        max_retries = 3
        retry_delay = 2  # seconds (default for most providers)
        last_exception = None
        for attempt in range(1, max_retries + 1):
            try:
                # Create provider-specific client using Factory pattern
                client = LLMClientFactory.create(
                    provider=provider,
                    api_key=api_key,
                    base_url=base_url
                )
                # Generate response using the appropriate client
                response = client.generate(
                    model=model_param,
                    system_prompt=prompt_dict["system"],
                    user_prompt=prompt_dict["user"],
                    temperature=temperature,
                    top_p=top_p,
                    max_tokens=tokens_to_use
                )
                # Extract code from response (remove markdown formatting and explanations)
                try:
                    code = extract_code_from_response(response["content"])
                except CodeExtractionError as e:
                    # Debug logging: print raw API response for analysis
                    import sys
                    sys.stderr.write("\n" + "="*80 + "\n")
                    sys.stderr.write("🔍 DEBUG: Code extraction failed. Raw API response:\n")
                    sys.stderr.write("="*80 + "\n")
                    sys.stderr.write(response["content"] + "\n")
                    sys.stderr.write("="*80 + "\n")
                    sys.stderr.write(f"Error: {e}\n")
                    sys.stderr.write("="*80 + "\n\n")
                    sys.stderr.flush()
                    raise RuntimeError(f"Failed to extract valid JavaScript code from model output: {e}") from e
                return {
                    'code': code,
                    'tokens': response["tokens"],
                    'latency': response["latency"]
                }
            except ImportError as e:
                raise RuntimeError(f"Missing dependency for {provider}: {e}") from e
            except RuntimeError as e:
                # Don't retry RuntimeError (e.g., code extraction failures)
                # These are not transient API errors
                err_str = str(e)
                if "Failed to extract valid JavaScript code" in err_str:
                    # Code extraction error - print additional context and fail immediately
                    import sys
                    sys.stderr.write(f"\n⚠️  Code extraction failed for {provider.upper()} provider\n")
                    sys.stderr.write("\n" + "="*80 + "\n")
                    sys.stderr.write("🔍 DEBUG: Code extraction failed. Raw API response:\n")
                    sys.stderr.write("="*80 + "\n")
                    sys.stderr.write(response["content"] + "\n")
                    sys.stderr.write("="*80 + "\n")
                    sys.stderr.write(f"Error: {e}\n")
                    sys.stderr.write("="*80 + "\n\n")
                    sys.stderr.flush()
                    raise
                # Other RuntimeErrors - wrap with provider context
                provider_name = provider.upper() if provider else "UNKNOWN"
                raise RuntimeError(f"{provider_name} API call failed: {e}") from e
            except Exception as e:
                last_exception = e
                err_str = str(e)
                # Retry for server overload, 429, or similar errors
                if any(keyword in err_str.lower() for keyword in ["server overload", "429", "too many requests", "overload", "rate limit", "temporarily unavailable"]):
                    if attempt < max_retries:
                        # Anthropic requires 60 second wait for 429 rate limits
                        # Per their docs: retry-after header indicates wait time
                        wait_time = 60 if (provider == LLMProvider.ANTHROPIC and "429" in err_str) else retry_delay
                        time.sleep(wait_time)
                        continue
                provider_name = provider.upper() if provider else "UNKNOWN"
                raise RuntimeError(f"{provider_name} API call failed: {e}") from e