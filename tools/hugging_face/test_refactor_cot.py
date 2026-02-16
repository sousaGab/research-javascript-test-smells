from openai import OpenAI
import os
from dotenv import load_dotenv
from constants import ANONYMOUS_TEST, TEST_SMELL_CATALOG, SUBOPTIMAL_ASSERTION, OVERCOMMENTED_TEST

load_dotenv()

# Models available through HuggingFace router with provider suffixes
CHAT_MODELS = {
    # DeepSeek via Novita provider
    "deepseek-ai/DeepSeek-R1:novita",
    "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B:novita",
    
    # Qwen Coder models
    "Qwen/Qwen2.5-Coder-32B-Instruct",
    "Qwen/Qwen2.5-Coder-32B-Instruct:together",
    "Qwen/Qwen2.5-Coder-32B-Instruct:deepinfra",
    
    # Llama models (try without suffix first, then with provider if needed)
    "meta-llama/Llama-3.1-70B-Instruct",
}

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


def refactor_test_smell(
    smell_name,
    test_code,
    prompt_type="cot",
    model_name="Qwen/Qwen2.5-Coder-32B-Instruct",
):
    """
    Refactor a test smell using HuggingFace's router with OpenAI-compatible API.
    """

    # --- Prompt selection ---
    if prompt_type == "zero_shot":
        prompt = create_zero_shot_prompt(smell_name, test_code)
    elif prompt_type == "few_shot":
        prompt = create_few_shot_prompt(smell_name, test_code)
    elif prompt_type == "cot":
        prompt = create_chain_of_thought_prompt(smell_name, test_code)
    else:
        raise ValueError(f"Unknown prompt_type: {prompt_type}")

    # Initialize OpenAI client with HuggingFace router
    client = OpenAI(
        base_url="https://router.huggingface.co/v1",
        api_key=os.getenv("HF_TOKEN"),
    )

    try:
        # All models use chat completions API
        messages = [{"role": "user", "content": prompt}]

        response = client.chat.completions.create(
            model=model_name,
            messages=messages,
            temperature=0.6,
            max_tokens=1024,
        )

        output = response.choices[0].message.content.strip()

    except Exception as e:
        output = f"[ERROR] API call failed: {e}"

    return output

if __name__ == "__main__":
    test_code = """
    it('works', async () => {
        const wrapper = mount(BDropdownDivider)

        expect(wrapper.element.tagName).toBe('LI')

        const divider = wrapper.find('hr')
        expect(divider.element.tagName).toBe('HR')
        expect(divider.classes()).toContain('dropdown-divider')
        expect(divider.classes().length).toBe(1)
        expect(divider.attributes('role')).toBeDefined()
        expect(divider.attributes('role')).toEqual('separator')
        expect(divider.text()).toEqual('')

        wrapper.destroy()
    })
    """
    
    # smell_name = SUBOPTIMAL_ASSERTION
    smell_name = ANONYMOUS_TEST

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
