it('`isJSONContent()` should correctly detect JSON content types', () => {
  const cases = [
    {
      name: 'returns true for application/json',
      headers: { 'content-type': 'application/json' },
      expected: true,
    },
    {
      name: 'returns true for application/json with charset',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      expected: true,
    },
    {
      name: 'returns false for non-JSON content type',
      headers: { 'content-type': 'text/plain' },
      expected: false,
    },
  ]

  cases.forEach(({ name, headers, expected }) => {
    expect(common.isJSONContent(headers), name).to.equal(expected)
  })
})