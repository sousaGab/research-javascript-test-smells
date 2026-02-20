it('should be triggered after add', function (done) {
  list.on('updated', function (list) {
    expect(list.length).toBe(1);
    done();
  });
  list.add({ name: 'Hej' });
});