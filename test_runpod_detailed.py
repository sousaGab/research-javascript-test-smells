#!/usr/bin/env python3
"""
Detailed test of RunPod TGI with different parameters
"""
import requests
import json

RUNPOD_URL = "https://brb26iqxgjl3zk-8080.proxy.runpod.net"

def test_with_params(params_desc, payload):
    """Test generation with specific parameters"""
    print(f"\n{'='*80}")
    print(f"Test: {params_desc}")
    print(f"{'='*80}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(
            f"{RUNPOD_URL}/generate",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        
        print(f"\nStatus: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\nFull response keys: {list(result.keys())}")
            print(f"\nRaw JSON response:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Failed: {e}")

# Test 1: Simple prompt with low temperature
test_with_params(
    "Simple prompt, temp=0.1",
    {
        "inputs": "function hello() {",
        "parameters": {
            "max_new_tokens": 50,
            "temperature": 0.1,
            "do_sample": False,
            "return_full_text": False
        }
    }
)

# Test 2: Code completion with stop tokens
test_with_params(
    "Code completion with stop tokens",
    {
        "inputs": "// Write a JavaScript function that adds two numbers\nfunction add(a, b) {",
        "parameters": {
            "max_new_tokens": 100,
            "temperature": 0.2,
            "top_p": 0.95,
            "do_sample": True,
            "return_full_text": False,
            "stop": ["\n\n", "function ", "//"]
        }
    }
)

# Test 3: Info endpoint
print(f"\n{'='*80}")
print("Checking /info endpoint for model details")
print(f"{'='*80}")
try:
    response = requests.get(f"{RUNPOD_URL}/info", timeout=10)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        info = response.json()
        print(f"\nModel Info:")
        print(json.dumps(info, indent=2))
except Exception as e:
    print(f"Failed: {e}")
