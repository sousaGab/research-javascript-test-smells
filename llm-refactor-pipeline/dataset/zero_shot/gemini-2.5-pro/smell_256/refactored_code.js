it('should trigger both handlers', (done) => {
  let callCount = 0;

  const handler = () => {
    callCount++;
    if (callCount === 2) {
      expect(callCount).toBe(2);
      done();
    }
  };

  list.on('updated', handler);
  list.on('updated', handler);

  list.search('jonny');
});