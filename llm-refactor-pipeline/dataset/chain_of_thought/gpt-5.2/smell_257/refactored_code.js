// Your COMPLETE refactored test code here
it('should be triggered after add', function (done) {
  const item = { name: 'Hej' };

  list.on('updated', function (updatedList) {
    expect(updatedList).toBeDefined();
    expect(updatedList).toBe(list);

    if (typeof list.length === 'number') {
      expect(list.length).toBeGreaterThan(0);
    } else if (typeof list.size === 'number') {
      expect(list.size).toBeGreaterThan(0);
    } else if (typeof list.items?.length === 'number') {
      expect(list.items.length).toBeGreaterThan(0);
    }

    done();
  });

  list.add(item);
});