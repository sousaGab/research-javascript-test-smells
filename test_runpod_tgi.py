#!/usr/bin/env python3
"""
Quick test script to verify RunPod TGI connection
"""
import sys
import requests

RUNPOD_URL = "https://brb26iqxgjl3zk-8080.proxy.runpod.net"

def test_health():
    """Check if the TGI endpoint is reachable"""
    print(f"Testing connection to {RUNPOD_URL}...")
    
    try:
        # Try health check
        response = requests.get(f"{RUNPOD_URL}/health", timeout=10)
        print(f"✓ Health endpoint status: {response.status_code}")
        if response.status_code == 200:
            print(f"  Response: {response.text}")
    except Exception as e:
        print(f"✗ Health check failed: {e}")
    
    print()

def test_generate():
    """Test actual generation"""
    print(f"Testing generation at {RUNPOD_URL}/generate...")
    
    payload = {
        "inputs": "Write a simple hello world function in JavaScript",
        "parameters": {
            "max_new_tokens": 100,
            "temperature": 0.7,
            "do_sample": True
        }
    }
    
    try:
        response = requests.post(
            f"{RUNPOD_URL}/generate",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        print(f"✓ Generate endpoint status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            generated = result.get("generated_text", "")
            print(f"\n  Generated text ({len(generated)} chars):")
            print(f"  {generated[:200]}...")
        else:
            print(f"✗ Error response: {response.text}")
            
    except requests.exceptions.Timeout:
        print(f"✗ Request timed out after 60 seconds")
    except requests.exceptions.ConnectionError as e:
        print(f"✗ Connection failed: {e}")
    except Exception as e:
        print(f"✗ Generation failed: {e}")

if __name__ == "__main__":
    print("=" * 80)
    print("RunPod TGI Connection Test")
    print("=" * 80)
    print()
    
    test_health()
    test_generate()
    
    print()
    print("=" * 80)
