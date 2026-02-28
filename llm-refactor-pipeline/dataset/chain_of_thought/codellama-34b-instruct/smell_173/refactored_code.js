// Your COMPLETE refactored test code here
it('supports built in properties', async () => {
    const event = new BvModalEvent('foobar', {
      target: 'baz',
      trigger: 'ok',
      componentId: 'foo'
    })
    expect(event).toBeInstanceOf(BvModalEvent)
    expect(event.type).toBe('foobar')
    expect(event.cancelable).toBe(true)
    expect(event.target).toBe('baz')
    expect(event.trigger).toBe('ok')
    expect(event.componentId).toBe('foo')

    let failed = false
    try {
      event.trigger = 'foobar'
    } catch (e) {
      failed = true
    }
    expect(failed).toBe(true)
    expect(event.trigger).toBe('ok')
  })