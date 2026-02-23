// Your COMPLETE refactored test code here
it('throws exception if no type given', async () => {
    let event = null
    let failed = false
    try {
      event = new BvEvent()
    } catch (e) {
      failed = true
    }
    expect(event).not.toBeInstanceOf(BvEvent)
    expect(event).toBe(null)
    expect(failed).toBe(true)
  })