#!/usr/bin/env python3
"""
Test native TGI /generate endpoint with code generation
"""
import requests
import json

RUNPOD_URL = "https://brb26iqxgjl3zk-8080.proxy.runpod.net"

# Test with a code refactoring prompt
system_prompt = """You are an expert JavaScript developer. Your task is to refactor the given code to fix test smells and improve code quality."""

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

full_prompt = f"{system_prompt}\n\n{user_prompt}"

payload = {
    "inputs": full_prompt,
    "parameters": {
        "max_new_tokens": 300,
        "temperature": 0.2,
        "top_p": 0.95,
        "do_sample": True,
    }
}

print("Sending request to TGI /generate endpoint...")
print(f"Prompt length: {len(full_prompt)} chars\n")

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
        
        print("="*80)
        print("GENERATED OUTPUT:")
        print("="*80)
        print(generated)
        print("="*80)
        print(f"\nOutput length: {len(generated)} chars")
        
        # Check if output is garbled
        if generated.count('\n\n') > 50 or 'tr' * 10 in generated or '0' * 50 in generated:
            print("\n⚠️  OUTPUT APPEARS GARBLED")
            print("This model is incompatible with TGI on this RunPod instance")
        elif '```javascript' in generated or 'function' in generated:
            print("\n✅ OUTPUT APPEARS VALID")
        else:
            print("\n⚠️  OUTPUT MAY BE INVALID")
            
    else:
        print(f"Error {response.status_code}: {response.text}")
        
except Exception as e:
    print(f"Request failed: {e}")
