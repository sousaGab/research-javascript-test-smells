#!/usr/bin/env python3
"""
Comprehensive RunPod TGI diagnostics
"""
import requests
import json

RUNPOD_URL = "https://brb26iqxgjl3zk-8080.proxy.runpod.net"

print("="*80)
print("RunPod TGI Diagnostic Report")
print("="*80)

# 1. Health check
print("\n1. Health Check:")
try:
    r = requests.get(f"{RUNPOD_URL}/health", timeout=10)
    print(f"   Status: {r.status_code} - {'OK' if r.status_code == 200 else 'ERROR'}")
except Exception as e:
    print(f"   ERROR: {e}")

# 2. Model info
print("\n2. Model Information:")
try:
    r = requests.get(f"{RUNPOD_URL}/info", timeout=10)
    if r.status_code == 200:
        info = r.json()
        print(f"   Model: {info.get('model_id', 'N/A')}")
        print(f"   Version: {info.get('version', 'N/A')}")
        print(f"   Max Input Tokens: {info.get('max_input_tokens', 'N/A')}")
        print(f"   Max Total Tokens: {info.get('max_total_tokens', 'N/A')}")
    else:
        print(f"   ERROR: Status {r.status_code}")
except Exception as e:
    print(f"   ERROR: {e}")

# 3. Metrics check
print("\n3. Metrics:")
try:
    r = requests.get(f"{RUNPOD_URL}/metrics", timeout=10)
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        metrics = r.text
        # Look for key metrics
        for line in metrics.split('\n'):
            if 'tgi_request_success' in line and not line.startswith('#'):
                print(f"   {line}")
            if 'tgi_request_failure' in line and not line.startswith('#'):
                print(f"   {line}")
except Exception as e:
    print(f"   ERROR: {e}")

# 4. Simple generation test
print("\n4. Simple Generation Test:")
test_payloads = [
    ("Greedy (temp=0)", {
        "inputs": "Hello",
        "parameters": {
            "max_new_tokens": 20,
            "temperature": None,  # Greedy
            "do_sample": False
        }
    }),
    ("Low temp", {
        "inputs": "def hello():",
        "parameters": {
            "max_new_tokens": 30,
            "temperature": 0.1,
            "do_sample": True
        }
    })
]

for desc, payload in test_payloads:
    print(f"\n   Test: {desc}")
    print(f"   Input: {payload['inputs'][:50]}")
    try:
        r = requests.post(
            f"{RUNPOD_URL}/generate",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        if r.status_code == 200:
            result = r.json()
            generated = result.get("generated_text", "")
            print(f"   Output length: {len(generated)} chars")
            print(f"   Output: {repr(generated[:100])}")
        else:
            print(f"   ERROR: Status {r.status_code} - {r.text[:200]}")
    except Exception as e:
        print(f"   ERROR: {e}")

print("\n" + "="*80)
print("\nDIAGNOSTIC COMPLETE")
print("\nIf outputs are garbled or empty, the model may need to be:")
print("  1. Restarted in RunPod console")
print("  2. Redeployed with different parameters")
print("  3. Replaced with a different model variant")
print("="*80)
