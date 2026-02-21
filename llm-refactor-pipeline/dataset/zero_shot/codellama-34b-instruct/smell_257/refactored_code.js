it('should be triggered after add', function (done) {
  let updatedEventTriggered = false;
  list.on('updated', function (list) {
    updatedEventTriggered = true;
    done();
  });
  list.add({ name: 'Hej' });
  expect(updatedEventTriggered).toBe(true);
  done();
});