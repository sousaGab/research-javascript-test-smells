it('should trigger updated event after add', function (done) {
  list.on('updated', function (updatedList) {
    expect(updatedList).to.equal(list);
    done();
  });
  list.add({ name: 'Hej' });
});