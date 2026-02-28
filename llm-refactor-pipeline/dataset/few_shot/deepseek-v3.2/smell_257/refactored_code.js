it('should be triggered after add', function (done) {
  list.on('updated', function (list) {
    expect(list).toBeDefined();
    done();
  });
  list.add({ name: 'Hej' });
});