#!/usr/bin/env python3
"""
Debug WHY the regex is matching beyond the closing backticks.
"""
import re

llm_output = """```javascript
  })
```

**Explanation:**"""

print("Testing minimal case...")
print(f"Input: {repr(llm_output)}")

pattern1 = r'```(?:javascript|js)\s*\n(.*?)```'
matches1 = re.findall(pattern1, llm_output, re.DOTALL | re.IGNORECASE)
print(f"\nPattern 1: {pattern1}")
if matches1:
    print(f"Match: {repr(matches1[0])}")
    print(f"Length: {len(matches1[0])}")

# Try different patterns
pattern2 = r'```(?:javascript|js)[^\n]*\n(.*?)```'
matches2 = re.findall(pattern2, llm_output, re.DOTALL | re.IGNORECASE)
print(f"\nPattern 2: {pattern2}")
if matches2:
    print(f"Match: {repr(matches2[0])}")
    print(f"Length: {len(matches2[0])}")

# Most explicit pattern
pattern3 = r'```(?:javascript|js)[^\n]*\n((?:(?!```).)*)'
matches3 = re.findall(pattern3, llm_output, re.DOTALL | re.IGNORECASE)
print(f"\nPattern 3 (negative lookahead): {pattern3}")
if matches3:
    print(f"Match: {repr(matches3[0])}")
    print(f"Length: {len(matches3[0])}")

print("\n" + "="*70)
print("Now test with FULL LLM output...")
