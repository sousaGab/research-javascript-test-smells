#!/usr/bin/env python3
"""
Test DeepSeek Coder with proper instruction format
"""
import requests
import json

RUNPOD_URL = "https://brb26iqxgjl3zk-8080.proxy.runpod.net"

def test_deepseek_format():
    """
    DeepSeek Coder Instruct uses this format:
    
    ### Instruction:
    {instruction}
    
    ### Response:
    {response}
    """
    
    # Proper DeepSeek instruction format
    prompt = """### Instruction:
Write a simple JavaScript function that adds two numbers and returns the result.

### Response:
"""
    
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 200,
            "temperature": 0.2,
            "top_p": 0.95,
            "do_sample": True,
            "return_full_text": False,
            "stop": ["###", "\n\n\n"]
        }
    }
    
    print("Testing with DeepSeek Coder instruction format:")
    print(f"Prompt:\n{prompt}")
    print("\n" + "="*80 + "\n")
    
    try:
        response = requests.post(
            f"{RUNPOD_URL}/generate",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            generated = result.get("generated_text", "")
            print(f"Generated code:\n{generated}")
        else:
            print(f"Error {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_deepseek_format()
