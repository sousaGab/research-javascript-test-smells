from click import prompt
from huggingface_hub import InferenceClient
import os
from dotenv import load_dotenv
from test_smell_constants import SUBOPTIMAL_ASSERTION, smell_descriptions, refactoring_guidance
load_dotenv()
from test_smell_constants import smell_descriptions, refactoring_guidance, SUBOPTIMAL_ASSERTION

def create_chain_of_thought_prompt(input_data):
    smell_description = input_data.get('smellDescription', '')
    refactoring_guidance = input_data.get('refactoringGuidance', '')
    test_code = input_data.get('testCode', '')
    smell_location = input_data.get('smellLocation', '')

    prompt = rf"""
		You are a senior software engineer and researcher specializing in automated test quality and test smell refactoring in JavaScript test suites.

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

def refactor_test_smell(input_data, model_name="deepseek-ai/DeepSeek-R1-Distill-Qwen-32B"):
    prompt = create_chain_of_thought_prompt(input_data)
    
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
    test_input = {
        "smellDescription": smell_descriptions[SUBOPTIMAL_ASSERTION],
        "refactoringGuidance": refactoring_guidance[SUBOPTIMAL_ASSERTION],
        "testCode": """test("Resets internal status", () => {
 img.setAttribute("src", url200);
 setSources(img, settings, instance);
 cancelLoading(img, entry, settings, instance);
 expect(getStatus(img)).toBe(null);
 });""",
        "smellLocation": "Line 5"
    }
    
    result = refactor_test_smell(test_input)
    print("Refactored Code:")
    print(result)
