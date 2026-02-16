"""Test different Llama model configurations to find what's available."""

from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

# Different Llama model variations to test
LLAMA_MODELS = [
    # Llama 3.1 variants
    "meta-llama/Meta-Llama-3.1-70B-Instruct",
    "meta-llama/Llama-3.1-70B-Instruct",
    "meta-llama/Meta-Llama-3.1-70B-Instruct:together",
    "meta-llama/Meta-Llama-3.1-70B-Instruct:deepinfra",
    "meta-llama/Meta-Llama-3.1-70B-Instruct:fireworks",
    "meta-llama/Llama-3.1-70B-Instruct:together",
    "meta-llama/Llama-3.1-70B-Instruct:deepinfra",
    "meta-llama/Llama-3.1-70B-Instruct:fireworks",
    
    # Llama 3.1 8B variants
    "meta-llama/Meta-Llama-3.1-8B-Instruct",
    "meta-llama/Llama-3.1-8B-Instruct",
    "meta-llama/Meta-Llama-3.1-8B-Instruct:together",
    "meta-llama/Llama-3.1-8B-Instruct:together",
    
    # Llama 3 variants
    "meta-llama/Meta-Llama-3-70B-Instruct",
    "meta-llama/Llama-3-70B-Instruct",
]

def test_model(client, model_name):
    """Test if a model is available by making a simple inference call."""
    try:
        print(f"Testing {model_name:60s}...", end=" ")
        messages = [{"role": "user", "content": "Say 'OK'"}]
        
        response = client.chat.completions.create(
            model=model_name,
            messages=messages,
            max_tokens=5,
            timeout=10,
        )
        
        result = response.choices[0].message.content.strip()
        print(f"✓ WORKS (response: {result})")
        return True
    except Exception as e:
        error_msg = str(e)
        if "not supported" in error_msg.lower():
            print("✗ Not supported")
        elif "not found" in error_msg.lower():
            print("✗ Not found")
        elif "rate limit" in error_msg.lower():
            print("⚠ Rate limited (but might work)")
            return True
        elif "overload" in error_msg.lower():
            print("⚠ Server overload (try again later)")
            return True
        else:
            print(f"✗ Error: {error_msg[:80]}...")
        return False

if __name__ == "__main__":
    token = os.getenv("HF_TOKEN")
    if not token:
        print("ERROR: HF_TOKEN not found in .env file")
        exit(1)
    
    print("Testing Llama models with HuggingFace router...")
    print("=" * 80)
    
    client = OpenAI(
        base_url="https://router.huggingface.co/v1",
        api_key=token,
    )
    
    available_models = []
    
    for model in LLAMA_MODELS:
        if test_model(client, model):
            available_models.append(model)
    
    print("\n" + "=" * 80)
    print(f"\nAvailable Llama models ({len(available_models)}):")
    for model in available_models:
        print(f"  ✓ {model}")
    
    if available_models:
        print(f"\n✓ Recommended: Use '{available_models[0]}' in test_refactor_cot.py")
    else:
        print("\n⚠ No Llama models available with your current setup.")
        print("   Falling back to DeepSeek models is recommended.")
