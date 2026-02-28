describe('isJSONContent', () => {
  it('returns true for application/json content type', () => {
    const headers = { 'content-type': 'application/json' }

    const result = common.isJSONContent(headers)

    expect(result).to.equal(true)
  })

  it('returns true for application/json with charset', () => {
    const headers = { 'content-type': 'application/json; charset=utf-8' }

    const result = common.isJSONContent(headers)

    expect(result).to.equal(true)
  })

  it('returns false for non-JSON content type', () => {
    const headers = { 'content-type': 'text/plain' }

    const result = common.isJSONContent(headers)

    expect(result).to.equal(false)
  })
})