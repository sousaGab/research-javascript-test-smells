it('should trigger updated event after add', function (done) {
  list.on('updated', function (list) {
    expect(list).toBeDefined();
    done();
  });
  list.add({ name: 'Hej' });
});