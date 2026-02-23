#!/usr/bin/env python3
"""
Comprehensive test to validate extract_code_from_response() with actual LLM output.
Tests the exact failing case to ensure the fix works.
"""

import re
import sys


def strip_javascript_comments(code: str) -> str:
    """
    Remove both single-line and multi-line JavaScript comments.
    """
    # Remove single-line comments (//...)
    code = re.sub(r'//[^\n]*', '', code)
    
    # Remove multi-line comments (/* ... */)
    code = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)
    
    return code


def count_delimiters(code: str) -> dict:
    """Count all brackets, braces, and parentheses."""
    return {
        'open_paren': code.count('('),
        'close_paren': code.count(')'),
        'open_brace': code.count('{'),
        'close_brace': code.count('}'),
        'open_bracket': code.count('['),
        'close_bracket': code.count(']'),
    }


def validate_balance(code: str) -> tuple[bool, str]:
    """Check if delimiters are balanced."""
    counts = count_delimiters(code)
    
    issues = []
    if counts['open_paren'] != counts['close_paren']:
        issues.append(f"Parentheses: ( {counts['open_paren']} vs ) {counts['close_paren']}")
    if counts['open_brace'] != counts['close_brace']:
        issues.append(f"Braces: {{ {counts['open_brace']} vs }} {counts['close_brace']}")
    if counts['open_bracket'] != counts['close_bracket']:
        issues.append(f"Brackets: [ {counts['open_bracket']} vs ] {counts['close_bracket']}")
    
    if issues:
        return False, "; ".join(issues)
    return True, "All delimiters balanced"


def contains_excessive_natural_language(code: str, threshold: float = 0.25) -> tuple[bool, float]:
    """
    Check if extracted code contains excessive natural language.
    Strips comments first to avoid false positives.
    """
    # Strip comments before checking
    code_without_comments = strip_javascript_comments(code)
    
    # Common English words that rarely appear in code
    natural_language_words = {
        'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'could', 'should', 'may', 'might', 'must', 'can', 'this',
        'that', 'these', 'those', 'with', 'from', 'about', 'into',
        'through', 'during', 'before', 'after', 'above', 'below',
        'between', 'under', 'again', 'further', 'then', 'once'
    }
    
    # Count occurrences of natural language words
    code_lower = code_without_comments.lower()
    word_count = sum(code_lower.count(f' {word} ') + code_lower.count(f' {word}\n')
                     for word in natural_language_words)
    
    total_chars = len(code_without_comments)
    if total_chars == 0:
        return False, 0.0
    
    ratio = word_count / total_chars
    return ratio > threshold, ratio


def extract_code_from_markdown(response: str) -> tuple[str | None, str]:
    """
    Extract JavaScript code from markdown code blocks.
    Returns (code, error_message).
    """
    # Pattern to match ```javascript or ```js code blocks
    pattern = r'```(?:javascript|js)\s*\n(.*?)```'
    matches = re.findall(pattern, response, re.DOTALL | re.IGNORECASE)
    
    if not matches:
        return None, "No JavaScript code block found"
    
    if len(matches) > 1:
        return None, f"Multiple code blocks found ({len(matches)}), expected exactly one"
    
    code = matches[0].rstrip()
    
    # Validate: Check for balanced delimiters
    is_balanced, balance_msg = validate_balance(code)
    if not is_balanced:
        return None, f"Unbalanced delimiters: {balance_msg}"
    
    # Validate: Check for excessive natural language
    has_excessive_nl, ratio = contains_excessive_natural_language(code)
    if has_excessive_nl:
        return None, f"Contains excessive natural language (ratio: {ratio:.4f})"
    
    return code, "Success"


def test_with_actual_llm_output():
    """Test with the actual failing LLM output."""
    
    # Read the actual LLM output from the debug file
    try:
        with open('/tmp/llm_debug/raw_llm_output.txt', 'r') as f:
            content = f.read()
        
        # Extract the LLM output (between the === lines)
        parts = content.split('=' * 70)
        if len(parts) < 3:
            print("❌ Cannot parse debug file")
            return False
        
        llm_output = parts[1].strip()
        
    except FileNotFoundError:
        print("❌ Debug file not found at /tmp/llm_debug/raw_llm_output.txt")
        print("   Run the actual experiment first to generate this file")
        return False
    
    print("=" * 70)
    print("TESTING CODE EXTRACTION WITH ACTUAL LLM OUTPUT")
    print("=" * 70)
    print(f"\nLLM output length: {len(llm_output)} characters\n")
    
    # Extract code
    code, error = extract_code_from_markdown(llm_output)
    
    if code:
        print("✅ CODE EXTRACTED SUCCESSFULLY\n")
        print(f"Extracted code length: {len(code)} characters")
        
        # Show first and last lines
        lines = code.split('\n')
        print(f"Total lines: {len(lines)}")
        print(f"\nFirst line: {lines[0][:80]}")
        print(f"Last line: {lines[-1][:80]}")
        
        # Check delimiters
        counts = count_delimiters(code)
        print(f"\nDelimiter counts:")
        print(f"  Parentheses: ( {counts['open_paren']} vs ) {counts['close_paren']} {'✓' if counts['open_paren'] == counts['close_paren'] else '✗'}")
        print(f"  Braces: {{ {counts['open_brace']} vs }} {counts['close_brace']} {'✓' if counts['open_brace'] == counts['close_brace'] else '✗'}")
        print(f"  Brackets: [ {counts['open_bracket']} vs ] {counts['close_bracket']} {'✓' if counts['open_bracket'] == counts['close_bracket'] else '✗'}")
        
        # Check natural language ratio
        code_without_comments = strip_javascript_comments(code)
        has_excessive, ratio = contains_excessive_natural_language(code)
        print(f"\nNatural language ratio: {ratio:.4f} (threshold: 0.25) {'✓' if not has_excessive else '✗'}")
        print(f"Code length without comments: {len(code_without_comments)} characters")
        
        return True
    else:
        print(f"❌ EXTRACTION FAILED: {error}\n")
        
        # Debug: Show what the regex actually extracts
        pattern = r'```(?:javascript|js)\s*\n(.*?)```'
        matches = re.findall(pattern, llm_output, re.DOTALL | re.IGNORECASE)
        
        if matches:
            extracted = matches[0]
            print(f"Debug: Regex found {len(matches)} match(es)")
            print(f"Debug: Extracted length: {len(extracted)} characters")
            
            # Show the end of extraction
            print(f"\nLast 150 characters of extracted code:")
            print(repr(extracted[-150:]))
            
            # Count delimiters
            counts = count_delimiters(extracted)
            print(f"\nDelimiter counts in extracted code:")
            print(f"  ( {counts['open_paren']} vs ) {counts['close_paren']}")
            print(f"  {{ {counts['open_brace']} vs }} {counts['close_brace']}")
            print(f"  [ {counts['open_bracket']} vs ] {counts['close_bracket']}")
            
            # Find where markdown block actually ends
            code_block_start = llm_output.find('```javascript')
            code_block_end = llm_output.find('```', code_block_start + 13)
            
            if code_block_end != -1:
                print(f"\nDebug: Code block positions:")
                print(f"  Start: {code_block_start}")
                print(f"  End: {code_block_end}")
                print(f"  Expected code length: {code_block_end - code_block_start - 14}")
                
                # What comes after the closing ```?
                after_block = llm_output[code_block_end:code_block_end + 100]
                print(f"\n100 chars after closing ```:")
                print(repr(after_block))
        
        return False


def test_simple_case():
    """Test with a simple working case."""
    print("\n" + "=" * 70)
    print("TESTING WITH SIMPLE CASE")
    print("=" * 70)
    
    simple_response = """```javascript
it('test', () => {
  expect(1).to.equal(1)
})
```"""
    
    code, error = extract_code_from_markdown(simple_response)
    
    if code:
        print("✅ Simple case works")
        print(f"   Code length: {len(code)} characters")
        return True
    else:
        print(f"❌ Simple case failed: {error}")
        return False


if __name__ == '__main__':
    print("\n🔍 CODE EXTRACTION VALIDATION TEST\n")
    
    # Test simple case first
    simple_ok = test_simple_case()
    
    # Then test with actual LLM output
    actual_ok = test_with_actual_llm_output()
    
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    print(f"Simple case: {'✅ PASS' if simple_ok else '❌ FAIL'}")
    print(f"Actual LLM output: {'✅ PASS' if actual_ok else '❌ FAIL'}")
    
    if simple_ok and actual_ok:
        print("\n🎉 ALL TESTS PASSED!")
        sys.exit(0)
    else:
        print("\n❌ SOME TESTS FAILED")
        sys.exit(1)
