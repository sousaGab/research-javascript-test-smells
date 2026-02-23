#!/usr/bin/env python3
"""
Find the exact issue with extraction - look at raw bytes.
"""
import re

# EXACT problematic output
llm_output = """```javascript
// Your COMPLETE refactored test code here

it('works when headers are removed on the socket event', done => {
    const server = http.createServer((request, response) => {
      proxyReq.end()
    })
    
    server.listen(() => {
      done()
    })
  })
```

**Explanation:**

The test code provided"""

print(f"Total LLM output length: {len(llm_output)} chars")
print(f"\nSearching for ``` markers...")

# Find all ``` positions
backticks = []
pos = 0
while True:
    pos = llm_output.find('```', pos)
    if pos == -1:
        break
    backticks.append(pos)
    print(f"  Position {pos}: {repr(llm_output[max(0,pos-10):pos+20])}")
    pos += 3

print(f"\nFound {len(backticks)} backtick markers")

if len(backticks) >= 2:
    start = backticks[0]
    end = backticks[1]
    
    # Find the newline after first ```
    first_newline = llm_output.find('\n', start)
    
    # The code should be from after first newline to just before second ```
    code_start = first_newline + 1
    code_end = end
    
    code = llm_output[code_start:code_end]
    
    print(f"\nManual extraction:")
    print(f"  Code starts at position {code_start}")
    print(f"  Code ends at position {code_end}")
    print(f"  Code length: {len(code)}")
    print(f"  First 80: {code[:80]}")
    print(f"  Last 80: {code[-80:]}")
    print(f"  Parens: ( {code.count('(')} vs ) {code.count(')')}")

# Now test regex
print(f"\n{'='*70}")
print("Testing regex pattern...")

pattern = r'```(?:javascript|js)\s*\n(.*?)```'
matches = re.findall(pattern, llm_output, re.DOTALL | re.IGNORECASE)

if matches:
    regex_code = matches[0]
    print(f"  Regex extracted length: {len(regex_code)}")
    print(f"  Last 80: {regex_code[-80:]}")
    print(f"  Parens: ( {regex_code.count('(')} vs ) {regex_code.count(')')}")
    
    # Compare
    if len(regex_code) != len(code):
        print(f"\n❌ MISMATCH: Regex extracted {len(regex_code)} but should be {len(code)}")
        print(f"   Extra {len(regex_code) - len(code)} characters")
        
        # Show what extra text was captured
        if len(regex_code) > len(code):
            extra = regex_code[len(code):]
            print(f"   Extra text: {repr(extra[:100])}")
