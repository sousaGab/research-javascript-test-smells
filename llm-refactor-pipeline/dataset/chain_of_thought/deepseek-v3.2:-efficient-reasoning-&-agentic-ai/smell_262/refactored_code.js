it('`isJSONContent()`', () => {
  const testCases = [
    {
      description: 'should return true for content-type application/json',
      headers: { 'content-type': 'application/json' },
      expected: true
    },
    {
      description: 'should return true for content-type application/json with charset',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      expected: true
    },
    {
      description: 'should return false for content-type text/plain',
      headers: { 'content-type': 'text/plain' },
      expected: false
    }
  ]

  testCases.forEach(({ description, headers, expected }) => {
    it(description, () => {
      expect(common.isJSONContent(headers)).to.equal(expected)
    })
  })
})