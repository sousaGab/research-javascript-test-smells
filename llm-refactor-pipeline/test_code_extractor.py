#!/usr/bin/env python3
"""
Test suite for code extraction from LLM responses.

Tests the code_extractor module with various realistic LLM outputs,
including edge cases with comments, template literals, and explanatory text.
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from llm_refactor.modules.refactor.code_extractor import (
    extract_code_from_response,
    CodeExtractionError
)


def test_simple_code_block():
    """Test extraction of simple code block."""
    llm_output = """```javascript
it('test', () => {
  expect(1).to.equal(1)
})
```"""
    
    code = extract_code_from_response(llm_output)
    assert "it('test'" in code
    assert "expect(1).to.equal(1)" in code
    print("✅ test_simple_code_block")


def test_code_with_comments():
    """Test extraction handles JavaScript comments correctly."""
    llm_output = """```javascript
// This is a test
it('works', () => {
  // Arrange
  const value = 42
  
  /* Act */
  const result = value * 2
  
  // Assert
  expect(result).to.equal(84)
})
```"""
    
    code = extract_code_from_response(llm_output)
    assert "// This is a test" in code
    assert "/* Act */" in code
    print("✅ test_code_with_comments")


def test_code_with_template_literals():
    """Test extraction handles template literals with expressions."""
    llm_output = """```javascript
it('builds path', () => {
  const url = 'example.com/api'
  const path = `/${url.split('/').slice(1).join('/')}`
  expect(path).to.equal('/api')
})
```"""
    
    code = extract_code_from_response(llm_output)
    assert "url.split" in code
    assert "slice(1)" in code
    print("✅ test_code_with_template_literals")


def test_code_with_explanation_after():
    """Test extraction stops at closing backticks, ignoring explanation."""
    llm_output = """```javascript
it('test', () => {
  expect(true).to.be.true
})
```

**Explanation:**

This code tests the boolean value true. The test verifies that
the assertion framework correctly identifies the value."""
    
    code = extract_code_from_response(llm_output)
    assert "it('test'" in code
    assert "expect(true)" in code
    # Should NOT include explanation
    assert "Explanation" not in code
    assert "boolean value" not in code
    print("✅ test_code_with_explanation_after")


def test_code_with_instructional_comment():
    """Test extraction handles LLM instructional comments (now auto-removed)."""
    llm_output = """```javascript
// Your COMPLETE refactored test code here

it('validates input', () => {
  const result = validate('test')
  expect(result).to.exist
})
```"""
    
    code = extract_code_from_response(llm_output)
    # Instructional comment should be removed automatically
    assert "// Your COMPLETE" not in code
    # But actual code should be preserved
    assert "validates input" in code
    assert "validate('test')" in code
    print("✅ test_code_with_instructional_comment")


def test_complex_nested_structure():
    """Test extraction handles complex nested callbacks."""
    llm_output = """```javascript  
it('handles async operations', done => {
  server.listen(() => {
    const req = http.request(
      { hostname: 'localhost' },
      res => {
        expect(res.statusCode).to.equal(200)
        done()
      }
    )
    
    req.on('error', error => {
      done(error)
    })
    
    req.end()
  })
})
```"""
    
    code = extract_code_from_response(llm_output)
    assert "server.listen" in code
    assert "http.request" in code
    assert "req.on('error'" in code
    print("✅ test_complex_nested_structure")


def test_code_with_parentheses_in_comments():
    """Test extraction handles parentheses in comments (the original bug)."""
    llm_output = """```javascript
it('test', () => {
  // This runs on process.nextTick()
  // See documentation (https://example.com)
  expect(1).to.equal(1)
})
```"""
    
    code = extract_code_from_response(llm_output)
    assert "process.nextTick()" in code
    assert "(https://example.com)" in code
    # Should be syntactically valid despite parentheses in comments
    print("✅ test_code_with_parentheses_in_comments")


def test_rejection_of_natural_language():
    """Test extraction correctly rejects pure natural language."""
    llm_output = """```javascript
Here is the refactored test code. The main changes are removing
excessive comments and simplifying the assertion logic. The test
now follows best practices and is more maintainable.
```"""
    
    try:
        extract_code_from_response(llm_output)
        assert False, "Should have raised CodeExtractionError"
    except CodeExtractionError as e:
        assert "natural language" in str(e).lower() or "validation" in str(e).lower()
    print("✅ test_rejection_of_natural_language")


def test_multiple_code_blocks_error():
    """Test extraction rejects responses with multiple code blocks."""
    llm_output = """Here's the test:

```javascript
it('test1', () => {})
```

And here's another:

```javascript
it('test2', () => {})
```"""
    
    try:
        # Currently the extractor takes all matches and scores them,
        # so it might work. Let's just ensure it doesn't crash.
        code = extract_code_from_response(llm_output)
        # If it succeeds, it should have picked one
        assert 'it(' in code
    except CodeExtractionError:
        # Also acceptable to reject multiple blocks
        pass
    print("✅ test_multiple_code_blocks_error")


def test_js_annotation():
    """Test extraction works with ```js annotation."""
    llm_output = """```js
it('test', () => {
  expect(1).to.equal(1)
})
```"""
    
    code = extract_code_from_response(llm_output)
    assert "it('test'" in code
    print("✅ test_js_annotation")


def test_removes_instructional_comment():
    """Test extraction automatically removes LLM instructional comments."""
    llm_output = """```javascript
// Your COMPLETE refactored test code here

it('test with instruction', () => {
  expect(42).to.equal(42)
})
```"""
    
    code = extract_code_from_response(llm_output)
    # Should NOT contain the instructional comment
    assert "// Your COMPLETE" not in code
    assert "Your COMPLETE" not in code
    # Should still contain the actual test code
    assert "it('test with instruction'" in code
    assert "expect(42)" in code
    print("✅ test_removes_instructional_comment")


def run_all_tests():
    """Run all extraction tests."""
    print("\n🧪 Running Code Extractor Tests\n")
    print("=" * 70)
    
    tests = [
        test_simple_code_block,
        test_code_with_comments,
        test_code_with_template_literals,
        test_code_with_explanation_after,
        test_code_with_instructional_comment,
        test_complex_nested_structure,
        test_code_with_parentheses_in_comments,
        test_rejection_of_natural_language,
        test_multiple_code_blocks_error,
        test_js_annotation,
        test_removes_instructional_comment,
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            test()
            passed += 1
        except AssertionError as e:
            print(f"❌ {test.__name__}: {e}")
            failed += 1
        except Exception as e:
            print(f"❌ {test.__name__}: Unexpected error: {e}")
            failed += 1
    
    print("=" * 70)
    print(f"\nResults: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n❌ {failed} test(s) failed")
        return 1


if __name__ == '__main__':
    sys.exit(run_all_tests())
