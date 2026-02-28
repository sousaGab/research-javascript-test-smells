it('should create a BvModalEvent instance with correct type', async () => {
  const eventType = 'foobar';
  const event = new BvModalEvent(eventType);
  
  expect(event).toBeInstanceOf(BvModalEvent);
  expect(event).toBeInstanceOf(BvEvent);
  expect(event.type).toBe(eventType);
});