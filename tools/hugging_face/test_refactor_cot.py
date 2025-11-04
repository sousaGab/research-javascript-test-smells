from huggingface_hub import InferenceClient
import os
from dotenv import load_dotenv
load_dotenv()

def create_chain_of_thought_prompt(input_data):
    smell_description = input_data.get('smellDescription', '')
    refactoring_guidance = input_data.get('refactoringGuidance', '')
    test_code = input_data.get('testCode', '')
    
    prompt = rf"""
        You are an expert software engineer specializing in test refactoring. Analyze the test smell and refactor the code following a step-by-step reasoning process.

        INPUT:
        Test Code with Smell:
        ```javascript
        {test_code}
        ```

        Chain of Thought:
        1. Identify the specific test smell in the code based on: "{smell_description}"
        2. Analyze why this smell is problematic for test maintenance and readability
        3. Plan the refactoring approach using: "{refactoring_guidance}"
        4. Apply the refactoring step-by-step while preserving test behavior
        5. Verify the refactored code follows best practices

        Output:
        Provide only the refactored JavaScript test code:
        ```javascript
        // Refactored code here
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
        "smellDescription": "SubOptimalAssert - Occurs when the assertions used in tests are not ideal for verifying the specific condition being tested. Using more specific and expressive assertions can improve test clarity and make results more useful",
        "refactoringGuidance": "Replace suboptimal assertions with more specific and descriptive assertions that provide clear feedback on what is being verified and why. In the refactored code, the suboptimal assertion has been replaced with a more appropriate one.",
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