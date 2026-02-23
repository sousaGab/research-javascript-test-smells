#!/usr/bin/env python3
"""
Test script to verify code_extractor behavioral changes.
Compares old vs new behavior on various test cases.
"""

import sys
sys.path.insert(0, '/home/gabriel/Disk/Research/research-javascript-test-smells/llm-refactor-pipeline/src')

from llm_refactor.modules.refactor.code_extractor import extract_code_from_response, CodeExtractionError


def test_case(name: str, input_text: str, should_succeed: bool = True):
    """Test a single case and report results."""
    print(f"\n{'='*60}")
    print(f"Test: {name}")
    print(f"{'='*60}")
    print(f"Input preview: {input_text[:100]}...")
    
    try:
        result = extract_code_from_response(input_text)
        if should_succeed:
            print(f"✅ SUCCESS - Extracted {len(result)} characters")
            print(f"Code preview: {result[:150]}...")
        else:
            print(f"⚠️  UNEXPECTED SUCCESS - Expected rejection but got code")
            print(f"Extracted: {result[:100]}...")
    except CodeExtractionError as e:
        if not should_succeed:
            print(f"✅ CORRECTLY REJECTED - {e}")
        else:
            print(f"❌ UNEXPECTED REJECTION - {e}")


# Test cases
print("BEHAVIORAL IMPACT ANALYSIS - Code Extractor Changes")
print("="*60)

# Case 1: Code WITHOUT comments (most common previous case)
test_case(
    "Code without comments",
    """```javascript
it('test', () => {
  expect(foo).toBe(bar);
});
```""",
    should_succeed=True
)

# Case 2: Code WITH inline comments (your original failing case)
test_case(
    "Code with inline comments (previously failed)",
    """```javascript
it('works when headers are removed on the socket event', done => {
    // Set up a nock that will fail if it gets an "authorization" header.
    const scope = nock('http://example.test', { badheaders: ['authorization'] })
      .get('/endpoint')
      .reply()

    // Create a server to act as our reverse proxy.
    const server = http.createServer((request, response) => {
      const proxyReq = http.request({
        host: 'example.test',
        path: `/${request.url.split('/').slice(1).join('/')}`,
        headers: request.headers,
      })
      proxyReq.end()
    })
    
    server.listen(() => {
      expect(res.statusCode).to.equal(200)
      done()
    })
  })
```""",
    should_succeed=True
)

# Case 3: Code that's MOSTLY comments
test_case(
    "Code with heavy comments",
    """```javascript
// This is a test that checks something
// It does many things
// Including setup and teardown
it('test', () => {
  // Assert something
  expect(1).toBe(1);
});
```""",
    should_succeed=True
)

# Case 4: Pure natural language (should still be rejected)
test_case(
    "Pure natural language explanation",
    """```javascript
The code has been refactored to eliminate the test smell by removing unnecessary comments and improving the structure of the code. The semantic behavior has been preserved.
```""",
    should_succeed=False
)

# Case 5: Mixed content - explanation + code
test_case(
    "Explanation followed by code",
    """Here's the refactored version:
```javascript
it('test', () => {
  expect(foo).toBe(bar);
});
```
This removes the smell by simplifying the test.""",
    should_succeed=True
)

# Case 6: Edge case - very short code with comments
test_case(
    "Very short code with comment",
    """```javascript
// Test
it('x', () => {})
```""",
    should_succeed=True
)

# Case 7: Code with JSDoc-style comments
test_case(
    "Code with JSDoc comments",
    """```javascript
/**
 * Test that verifies user authentication
 * @test
 */
it('authenticates user', () => {
  const user = authenticate('user', 'pass');
  expect(user).toBeDefined();
});
```""",
    should_succeed=True
)

# Case 8: Borderline case - 20-25% word density (now accepted, previously rejected)
test_case(
    "Borderline word density (20-25%)",
    """```javascript
function test case with some words and symbols () { return true; }
```""",
    should_succeed=True  # This might change behavior - now accepted
)

print("\n" + "="*60)
print("ANALYSIS COMPLETE")
print("="*60)
print("\nKEY CHANGES:")
print("1. ✅ Code WITH comments now accepted (fixes your issue)")
print("2. ⚠️  Threshold increased 20% → 25% (slightly more permissive)")
print("3. ✅ Heavily commented code now handled gracefully")
print("4. ✅ Pure explanations still rejected")
