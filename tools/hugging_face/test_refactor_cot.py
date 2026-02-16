from huggingface_hub import InferenceClient
import os
from dotenv import load_dotenv
from constants import TEST_SMELL_CATALOG, SUBOPTIMAL_ASSERTION

load_dotenv()

def create_zero_shot_prompt(smell_name, test_code):
    """Creates a zero-shot prompt for test smell refactoring."""
    smell_catalog = TEST_SMELL_CATALOG.get(smell_name, {})
    smell_description = smell_catalog.get('definition', '')
    
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


def create_few_shot_prompt(smell_name, test_code):
    """Creates a few-shot prompt for test smell refactoring with examples."""
    smell_catalog = TEST_SMELL_CATALOG.get(smell_name, {})
    smell_description = smell_catalog.get('definition', '')
    examples = smell_catalog.get('examples', [])
    
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


def create_chain_of_thought_prompt(smell_name, test_code):
    """Creates a chain-of-thought prompt for test smell refactoring."""
    smell_catalog = TEST_SMELL_CATALOG.get(smell_name, {})
    smell_description = smell_catalog.get('definition', '')
    refactoring_strategies = smell_catalog.get('refactoring_strategies', [])
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

def refactor_test_smell(smell_name, test_code, prompt_type="cot", model_name="deepseek-ai/DeepSeek-R1-Distill-Qwen-32B"):
    """
    Refactor a test smell using specified prompting strategy.
    
    Args:
        smell_name: Name of the test smell (from constants)
        test_code: The original test code to refactor
        prompt_type: "zero_shot", "few_shot", or "cot" (chain-of-thought)
        model_name: HuggingFace model to use
    """
    if prompt_type == "zero_shot":
        prompt = create_zero_shot_prompt(smell_name, test_code)
    elif prompt_type == "few_shot":
        prompt = create_few_shot_prompt(smell_name, test_code)
    elif prompt_type == "cot":
        prompt = create_chain_of_thought_prompt(smell_name, test_code)
    else:
        raise ValueError(f"Unknown prompt_type: {prompt_type}. Must be 'zero_shot', 'few_shot', or 'cot'.")
    
    # Initialize client with token only. The model is provided per-request.
    client = InferenceClient(token=os.getenv("HF_TOKEN"))

    # Use the conversational/chat endpoint because this model expects a
    # conversational task (the model mapping indicates "conversational").
    messages = [
        {"role": "user", "content": prompt}
    ]

    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=messages,
            temperature=0.6,
            max_tokens=1024,
        )

        # Extract the assistant reply text (mirror of earlier patterns).
        analysis = response.choices[0].message.content.strip()
    except Exception as e:
        analysis = f"[ERROR] API call failed: {e}"

    return analysis

if __name__ == "__main__":
    test_code = """test("Resets internal status", () => {
        img.setAttribute("src", url200);
        setSources(img, settings, instance);
        cancelLoading(img, entry, settings, instance);
        expect(getStatus(img)).toBe(null);
    });"""
    
    smell_name = SUBOPTIMAL_ASSERTION
    
    print("Testing Zero-Shot Prompting:")
    print("="*50)
    result_zero = refactor_test_smell(smell_name, test_code, prompt_type="zero_shot")
    print(result_zero)
    print("\n")
    
    print("Testing Few-Shot Prompting:")
    print("="*50)
    result_few = refactor_test_smell(smell_name, test_code, prompt_type="few_shot")
    print(result_few)
    print("\n")
    
    print("Testing Chain-of-Thought Prompting:")
    print("="*50)
    result_cot = refactor_test_smell(smell_name, test_code, prompt_type="cot")
    print(result_cot)
