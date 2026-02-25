it('should trigger the updated event after adding an item', function (done) {
  list.on('updated', function (list) {
    expect(list.length).toBe(1);
    done();
  });
  list.add({ name: 'Hej' });
});