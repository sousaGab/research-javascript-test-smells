"""
Robust JavaScript Code Extraction from LLM Responses.

This module provides quality-validated extraction of JavaScript code from LLM outputs,
with structural validation and natural language detection to prevent false positives.
"""

import re
from typing import List


class CodeExtractionError(Exception):
    """Raised when no valid JavaScript code can be extracted from LLM output."""


def extract_code_from_response(llm_output: str) -> str:
    """
    Extract and validate JavaScript code from LLM response with quality scoring.
    
    Uses a multi-stage pipeline:
    1. Extract all markdown code blocks (```javascript, ```js, or generic ```)
    2. Score each candidate based on JavaScript patterns and test indicators
    3. Validate structure (balanced braces) and content (low natural language)
    4. Return highest-quality valid candidate
    
    Args:
        llm_output: Raw output from LLM, potentially containing explanations
        
    Returns:
        Extracted and validated JavaScript code
        
    Raises:
        CodeExtractionError: If no valid JavaScript code block found
        
    Examples:
        >>> extract_code_from_response("```javascript\\ntest('foo', () => {});\\n```")
        "test('foo', () => {});"
        
        >>> extract_code_from_response("Here's the code:\\n```js\\nit('test', () => {});\\n```")
        "it('test', () => {});"
    """
    # Stage 1: Extract all markdown code blocks
    candidates = _extract_markdown_blocks(llm_output)
    
    if not candidates:
        # No markdown blocks found - check if raw output itself is valid code
        raw_stripped = llm_output.strip()
        if _has_balanced_braces(raw_stripped) and not _contains_excessive_natural_language(raw_stripped):
            return raw_stripped
        raise CodeExtractionError(
            "No markdown code blocks found and raw output appears to be natural language"
        )
    
    # Stage 2 & 3: Score and validate all candidates
    scored_candidates = []
    for code in candidates:
        score = _score_javascript_candidate(code)
        
        # Validate structure and content
        if _has_balanced_braces(code) and not _contains_excessive_natural_language(code):
            scored_candidates.append((score, code))
    
    if not scored_candidates:
        raise CodeExtractionError(
            f"Found {len(candidates)} code block(s) but none passed validation "
            "(balanced braces + low natural language)"
        )
    
    # Stage 4: Return highest-quality candidate
    scored_candidates.sort(reverse=True, key=lambda x: x[0])
    return scored_candidates[0][1].strip()


def _extract_markdown_blocks(text: str) -> List[str]:
    """
    Extract all markdown code blocks from text.
    
    Matches:
    - ```javascript ... ```
    - ```js ... ```
    - ``` ... ``` (generic)
    
    Args:
        text: Input text potentially containing code blocks
        
    Returns:
        List of extracted code strings (may be empty)
    """
    # Priority 1: JavaScript-labeled blocks
    js_pattern = r'```(?:javascript|js)\s*\n(.*?)\n```'
    js_matches = re.findall(js_pattern, text, re.DOTALL | re.IGNORECASE)
    
    if js_matches:
        return js_matches
    
    # Priority 2: Generic code blocks
    generic_pattern = r'```\s*\n(.*?)\n```'
    generic_matches = re.findall(generic_pattern, text, re.DOTALL)
    
    return generic_matches


def _score_javascript_candidate(code: str) -> int:
    """
    Score JavaScript code candidate based on patterns and test indicators.
    
    Scoring system:
    - Test framework patterns (it, describe, test, expect): +3 each
    - JavaScript keywords (function, const, let, var, return, async, await): +1 each
    - Arrow functions (=>): +1 each
    - Method calls (.method()): +1 each
    
    Higher scores indicate more likely valid JavaScript test code.
    
    Args:
        code: Code string to score
        
    Returns:
        Integer score (typically 0-20+)
    """
    score = 0
    
    # High-value test patterns (+3 each)
    test_patterns = [
        r'\bit\s*\(',           # it('test', ...)
        r'\bdescribe\s*\(',     # describe('suite', ...)
        r'\btest\s*\(',         # test('name', ...)
        r'\bexpect\s*\(',       # expect(value)
    ]
    for pattern in test_patterns:
        score += len(re.findall(pattern, code)) * 3
    
    # JavaScript keyword patterns (+1 each)
    js_patterns = [
        r'\bfunction\b',
        r'\bconst\b',
        r'\blet\b',
        r'\bvar\b',
        r'\breturn\b',
        r'\basync\b',
        r'\bawait\b',
        r'=>',                  # Arrow functions
        r'\.\w+\(',            # Method calls
    ]
    for pattern in js_patterns:
        score += len(re.findall(pattern, code))
    
    return score


def _has_balanced_braces(code: str) -> bool:
    """
    Check if code has balanced braces, brackets, and parentheses.
    
    Validates that all opening symbols have matching closing symbols
    in the correct order.
    
    Args:
        code: Code string to validate
        
    Returns:
        True if balanced, False otherwise
        
    Examples:
        >>> _has_balanced_braces("test('foo', () => {})")
        True
        
        >>> _has_balanced_braces("test('foo', () => {")
        False
    """
    stack = []
    pairs = {'(': ')', '[': ']', '{': '}'}
    closers = {')', ']', '}'}  # Set for O(1) lookup
    
    for char in code:
        if char in pairs:
            stack.append(char)
        elif char in closers:
            if not stack or pairs[stack.pop()] != char:
                return False
    
    return len(stack) == 0


def _contains_excessive_natural_language(code: str) -> bool:
    """
    Detect if code contains excessive natural language explanations.
    
    Uses word-to-character ratio heuristic:
    - Split on whitespace to count words
    - If word count is >20% of character count, likely natural language
    - Threshold tuned to distinguish explanatory text from code comments
    
    Args:
        code: Code string to analyze
        
    Returns:
        True if excessive natural language detected, False otherwise
        
    Examples:
        >>> _contains_excessive_natural_language("Here is how to refactor the test")
        True
        
        >>> _contains_excessive_natural_language("test('foo', () => { /* comment */ })")
        False
    """
    if not code.strip():
        return True
    
    word_count = len(code.split())
    char_count = len(code)
    
    # Code typically has low word-to-char ratio due to symbols and structure
    # Natural language has high ratio (many words, few symbols)
    # Threshold: 20% = likely explanatory text
    return word_count / char_count > 0.2
