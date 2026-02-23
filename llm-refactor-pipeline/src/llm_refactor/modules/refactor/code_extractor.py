"""
Robust JavaScript Code Extraction from LLM Responses.

This module provides quality-validated extraction of JavaScript code from LLM outputs,
with structural validation and natural language detection to prevent false positives.

IMPORTANT: Accepts code with JavaScript syntax errors (typos, incorrect keywords) but
rejects natural language prose. This is intentional for research purposes - we want to
capture LLM-generated code even when it contains bugs or errors.
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
    3. Validate structure (balanced delimiters) and content (low natural language)
    4. Return highest-quality valid candidate
    
    NOTE: Accepts code with JavaScript syntax errors (typos, incorrect keywords) but
    rejects natural language explanations. This allows capturing buggy LLM output.
    
    Args:
        llm_output: Raw output from LLM, potentially containing explanations
        
    Returns:
        Extracted and validated JavaScript code (may contain syntax errors)
        
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
        balanced = _has_balanced_braces(code)
        has_excessive_nl = _contains_excessive_natural_language(code)
        
        # Validate structure and content
        if balanced and not has_excessive_nl:
            scored_candidates.append((score, code))
    
    if not scored_candidates:
        raise CodeExtractionError(
            f"Found {len(candidates)} code block(s) but none passed validation "
            "(balanced structure + low natural language)"
        )
    
    # Stage 4: Return highest-quality candidate
    scored_candidates.sort(reverse=True, key=lambda x: x[0])
    code = scored_candidates[0][1].strip()
    
    # Stage 5: Clean up LLM instructional comments
    code = _remove_instructional_comments(code)
    
    return code


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
    # Updated pattern: match ``` without newline requirement (more robust)
    js_pattern = r'```(?:javascript|js)\s*\n(.*?)```'
    js_matches = re.findall(js_pattern, text, re.DOTALL | re.IGNORECASE)
    
    if js_matches:
        # Strip any trailing whitespace/newlines from each match
        return [match.rstrip() for match in js_matches]
    
    # Priority 2: Generic code blocks
    generic_pattern = r'```\s*\n(.*?)```'
    generic_matches = re.findall(generic_pattern, text, re.DOTALL)
    
    # Strip any trailing whitespace/newlines from each match
    return [match.rstrip() for match in generic_matches]


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
    Check if code has balanced structural delimiters.
    
    Only validates structural balance (braces, brackets, parentheses),
    allowing JavaScript syntax errors (typos, incorrect keywords, etc.).
    This is intentional for research purposes - we want to capture LLM
    output even when it contains syntax errors.
    
    Args:
        code: Code string to validate
        
    Returns:
        True if structurally balanced, False otherwise
        
    Examples:
        >>> _has_balanced_braces("test('foo', () => {})")
        True
        
        >>> _has_balanced_braces("test('foo', () => {")
        False
        
        >>> _has_balanced_braces("test('foo', () of => {})") # syntax error but balanced
        True
    """
    # Simple counting validation - allows syntax errors but rejects structural breaks
    braces_balanced = code.count('{') == code.count('}')
    brackets_balanced = code.count('[') == code.count(']')
    parens_balanced = code.count('(') == code.count(')')
    
    return braces_balanced and brackets_balanced and parens_balanced


def _contains_excessive_natural_language(code: str) -> bool:
    """
    Detect if code contains excessive natural language explanations.
    
    Uses word-to-character ratio heuristic after stripping JavaScript comments:
    - Remove single-line (//) and multi-line (/* */) comments
    - Split on whitespace to count words
    - If word count is >25% of character count, likely natural language
    - Threshold tuned to distinguish explanatory text from code
    
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
    
    # Strip JavaScript comments before analyzing
    # This allows legitimate code comments without triggering false positives
    code_without_comments = _strip_javascript_comments(code)
    
    # If stripping comments leaves very little code, it was mostly comments (valid)
    if len(code_without_comments.strip()) < 20:
        # Accept if original code had JavaScript patterns
        return _score_javascript_candidate(code) < 3
    
    word_count = len(code_without_comments.split())
    char_count = len(code_without_comments)
    ratio = word_count / char_count if char_count > 0 else 0
    
    # Code typically has low word-to-char ratio due to symbols and structure
    # Natural language has high ratio (many words, few symbols)
    # Threshold: 25% = likely explanatory text (increased from 20% to be more permissive)
    return ratio > 0.25


def _strip_javascript_comments(code: str) -> str:
    """
    Remove JavaScript comments from code.
    
    Removes:
    - Single-line comments (// ...)
    - Multi-line comments (/* ... */)
    
    Args:
        code: JavaScript code string
        
    Returns:
        Code with comments removed
    """
    # Remove multi-line comments /* ... */
    code = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)
    
    # Remove single-line comments // ...
    code = re.sub(r'//.*?$', '', code, flags=re.MULTILINE)
    
    return code


def _remove_instructional_comments(code: str) -> str:
    """
    Remove LLM instructional comments from extracted code.
    
    Removes lines containing:
    - "// Your COMPLETE refactored test code here"
    - Other common LLM instruction patterns
    
    Args:
        code: Extracted JavaScript code
        
    Returns:
        Code with instructional comments removed
        
    Examples:
        >>> code = "// Your COMPLETE refactored test code here\\n\\nit('test', () => {})"
        >>> _remove_instructional_comments(code)
        "it('test', () => {})"
    """
    if not code:
        return code
    
    lines = code.split('\n')
    cleaned_lines = []
    
    # Patterns to detect and remove
    instructional_patterns = [
        r'^\s*//\s*your\s+complete\s+refactored\s+test\s+code\s+here\s*$',
        r'^\s*//\s*complete\s+refactored\s+code\s+here\s*$',
        r'^\s*//\s*refactored\s+test\s+code\s*$',
    ]
    
    for line in lines:
        # Check if line matches any instructional pattern
        is_instructional = any(
            re.match(pattern, line, re.IGNORECASE) 
            for pattern in instructional_patterns
        )
        
        if not is_instructional:
            cleaned_lines.append(line)
    
    result = '\n'.join(cleaned_lines)
    
    # Remove multiple leading empty lines
    while result.startswith('\n\n'):
        result = result[1:]
    
    return result.strip()
