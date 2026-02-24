#!/usr/bin/env python3
"""
Check which model is actually loaded on RunPod
"""
import requests
import json

RUNPOD_URL = "https://brb26iqxgjl3zk-8080.proxy.runpod.net"

print("Checking RunPod /info endpoint...")
print("="*80)

try:
    response = requests.get(f"{RUNPOD_URL}/info", timeout=10)
    if response.status_code == 200:
        info = response.json()
        print(f"Currently loaded model: {info.get('model_id', 'Unknown')}")
        print(f"Version: {info.get('version', 'Unknown')}")
        print(f"Max input tokens: {info.get('max_input_tokens', 'Unknown')}")
        print(f"Max total tokens: {info.get('max_total_tokens', 'Unknown')}")
        print()
        
        model_id = info.get('model_id', '')
        
        if 'deepseek' in model_id.lower():
            print("⚠️  STILL RUNNING DEEPSEEK - This is causing garbled output")
            print()
            print("ACTION REQUIRED:")
            print("1. Go to: https://console.runpod.io/pods?id=brb26iqxgjl3zk")
            print("2. Stop the pod")
            print("3. Edit configuration → Container Start Command:")
            print("   --model-id codellama/CodeLlama-34b-Instruct-hf --port 8080 --max-input-length 4000 --max-total-tokens 4096 --max-batch-prefill-tokens 4096")
            print("4. Start the pod")
            print("5. Wait 10-15 minutes for download + loading")
            
        elif 'codellama' in model_id.lower() or 'llama' in model_id.lower():
            print("✅ CodeLlama is loaded!")
            print("   The garbled output issue should be resolved.")
            
        else:
            print(f"⚠️  Unknown model: {model_id}")
            
    else:
        print(f"Error: Status {response.status_code}")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"Failed to connect: {e}")
    print()
    print("The pod may be:")
    print("- Still starting up")
    print("- Being reconfigured")
    print("- Stopped")

print("="*80)
