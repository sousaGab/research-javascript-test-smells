describe('event options parsing', () => {
  describe('with passive event support', () => {
    beforeEach(() => {
      global.HAS_PASSIVE_EVENT_SUPPORT = true
    })

    it('converts boolean to object', () => {
      expect(parseEventOptions(true)).toEqual({ capture: true })
      expect(parseEventOptions(false)).toEqual({ capture: false })
      expect(parseEventOptions()).toEqual({ capture: false })
    })

    it('parses object correctly', () => {
      expect(parseEventOptions({ capture: false })).toEqual({ capture: false })
      expect(parseEventOptions({ capture: true })).toEqual({ capture: true })
      expect(parseEventOptions({})).toEqual({})
      expect(parseEventOptions({ capture: false, foobar: true })).toEqual({
        capture: false,
        foobar: true
      })
      expect(parseEventOptions({ capture: true, foobar: false })).toEqual({
        capture: true,
        foobar: false
      })
    })
  })

  describe('without passive event support', () => {
    beforeEach(() => {
      global.HAS_PASSIVE_EVENT_SUPPORT = false
    })

    it('converts non object to boolean', () => {
      expect(parseEventOptions(true)).toEqual(false)
      expect(parseEventOptions(false)).toEqual(false)
      expect(parseEventOptions()).toEqual(false)
      expect(parseEventOptions(null)).toEqual(false)
    })

    it('converts object to boolean', () => {
      expect(parseEventOptions({ capture: false })).toEqual(false)
      expect(parseEventOptions({ capture: true })).toEqual(true)
      expect(parseEventOptions({})).toEqual(false)
      expect(parseEventOptions({ capture: false, foobar: true })).toEqual(false)
      expect(parseEventOptions({ capture: true, foobar: true })).toEqual(true)
      expect(parseEventOptions({ foobar: true })).toEqual(false)
      expect(parseEventOptions({ foobar: false })).toEqual(false)
    })
  })
})