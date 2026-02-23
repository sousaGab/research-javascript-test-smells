it('should be triggered after add', function (done) {
  const onUpdated = function (updatedList) {
    try {
      expect(updatedList).toBe(list);
      list.off('updated', onUpdated);
      done();
    } catch (err) {
      list.off('updated', onUpdated);
      done(err);
    }
  };

  list.on('updated', onUpdated);
  list.add({ name: 'Hej' });
});