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

  expect(() => {
    event.trigger = 'foobar'
  }).toThrow()

  expect(event.trigger).toBe('ok')
})