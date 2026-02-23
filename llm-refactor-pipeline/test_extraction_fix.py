#!/usr/bin/env python3
"""
Test extraction fix with the EXACT LLM output that's failing.
This validates the fix works before applying to production.
"""
import re

# EXACT LLM output from your error
llm_output = """```javascript
// Your COMPLETE refactored test code here

it('works when headers are removed on the socket event', done => {
    // Set up a nock that will fail if it gets an "authorization" header.
    const scope = nock('http://example.test', { badheaders: ['authorization'] })
      .get('/endpoint')
      .reply()

    // Create a server to act as our reverse proxy.
    const server = http.createServer((request, response) => {
      // Make a request to the nock instance with the same request that came in.
      const proxyReq = http.request({
        host: 'example.test',
        // Get the path from the incoming request and pass it through.
        path: `/${request.url.split('/').slice(1).join('/')}`,
        headers: request.headers,
      })

      // When we connect, remove the authorization header (node-http-proxy uses
      // this event to do it).
      proxyReq.on('socket', () => {
        proxyReq.removeHeader('authorization')

        // End the request here, otherwise it ends up matching the request before
        // socket gets called because socket runs on `process.nextTick()`.
        proxyReq.end()
      })

      proxyReq.on('response', proxyRes => {
        proxyRes.pipe(response)
      })

      proxyReq.on('error', error => {
        expect.fail(error)
        done()
      })
    })

    server
      .listen(() => {
        // Now that the server's started up, make a request to it with an authorization header.
        const req = http.request(
          {
            hostname: 'localhost',
            path: '/endpoint',
            port: server.address().port,
            method: 'GET',
            headers: { authorization: 'blah' },
          },
          res => {
            // If we get a request, all good :)
            expect(res.statusCode).to.equal(200)
            scope.done()
            server.close(done)
          },
        )

        req.on('error', error => {
          expect.fail(error)
          done()
        })

        req.end()
      })
      .on('error', error => {
        expect.fail(error)
        done()
      })
  })
```

**Explanation:**

The test code provided has an OvercommentedTest smell"""

print("="*70)
print("EXTRACTION FIX VALIDATION")
print("="*70)

# FIXED pattern - more robust
fixed_pattern = r'```(?:javascript|js)\s*\n(.*?)```'
matches = re.findall(fixed_pattern, llm_output, re.DOTALL | re.IGNORECASE)

if matches:
    code = matches[0].rstrip()
    
    print(f"\n✅ Extraction successful!")
    print(f"   Length: {len(code)} chars")
    print(f"   First 80: {code[:80]}")
    print(f"   Last 80: {code[-80:]}")
    
    # Count braces
    opens_paren = code.count('(')
    closes_paren = code.count(')')
    opens_bracket = code.count('[')
    closes_bracket = code.count(']')
    opens_brace = code.count('{')
    closes_brace = code.count('}')
    
    print(f"\n   Brace counts:")
    print(f"      ( {opens_paren} vs ) {closes_paren} - {'✅ BALANCED' if opens_paren == closes_paren else '❌ UNBALANCED'}")
    print(f"      [ {opens_bracket} vs ] {closes_bracket} - {'✅ BALANCED' if opens_bracket == closes_bracket else '❌ UNBALANCED'}")
    print(f"      {{ {opens_brace} vs }} {closes_brace} - {'✅ BALANCED' if opens_brace == closes_brace else '❌ UNBALANCED'}")
    
    all_balanced = (opens_paren == closes_paren and 
                    opens_bracket == closes_bracket and 
                    opens_brace == closes_brace)
    
    if all_balanced:
        print(f"\n✅ ✅ ✅ EXTRACTION FIX VERIFIED - ALL BRACES BALANCED!")
        print(f"\nExtracted code is valid and ready for use.")
        exit(0)
    else:
        print(f"\n❌ EXTRACTION STILL BROKEN - braces not balanced")
        exit(1)
else:
    print("❌ No matches found")
    exit(1)
