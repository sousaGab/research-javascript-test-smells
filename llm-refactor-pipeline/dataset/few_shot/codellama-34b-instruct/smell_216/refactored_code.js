it('throws exception if no type given', async () => {
    let event = null
    let failed = false
    try {
      event = new BvModalEvent()
    } catch (e) {
      failed = true
    }
    expect(event).toBeNull()
    expect(failed).toBe(true)
  })