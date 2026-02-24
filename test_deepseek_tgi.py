#!/usr/bin/env python3
"""
Test DeepSeek instruction format with TGI
"""
import requests
import json

RUNPOD_URL = "https://brb26iqxgjl3zk-8080.proxy.runpod.net"

# Using DeepSeek Coder instruction format
system_prompt = "You are an expert JavaScript developer. Your task is to refactor the given code to fix test smells and improve code quality."
user_prompt = """Refactor this JavaScript test to remove code duplication:

```javascript
test('should add numbers', () => {
  const result = add(2, 3);
  expect(result).toBe(5);
});

test('should multiply numbers', () => {
  const result = multiply(2, 3);
  expect(result).toBe(6);
});
```

Return ONLY the refactored code wrapped in ```javascript code blocks."""

# Format: ### Instruction:\n{instruction}\n\n### Response:\n
full_prompt = f"### Instruction:\n{system_prompt}\n\n{user_prompt}\n\n### Response:\n"

payload = {
    "inputs": full_prompt,
    "parameters": {
        "max_new_tokens": 500,
        "temperature": 0.2,
        "top_p": 0.95,
        "do_sample": True,
        "stop": ["###", "<|EOT|>"]
    }
}

print("Testing DeepSeek Coder with proper instruction format...")
print("="*80)
print("Prompt format:")
print(full_prompt[:200] + "...")
print("="*80)

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
        
        print("\nGENERATED OUTPUT:")
        print("="*80)
        print(generated)
        print("="*80)
        print(f"\nLength: {len(generated)} chars")
        
        # Check quality
        if '```javascript' in generated or 'function' in generated or 'test(' in generated:
            print("\n✅ OUTPUT LOOKS VALID - Contains code!")
        elif generated.count('\n\n') > 50 or any(char * 20 in generated for char in ['0', '5', '-', 'é']):
            print("\n⚠️  OUTPUT IS GARBLED - Still producing junk")
        else:
            print("\n❓ OUTPUT UNCLEAR - Check manually")
            
    else:
        print(f"Error {response.status_code}: {response.text}")
        
except Exception as e:
    print(f"Request failed: {e}")
