it('should trigger searchComplete and update results based on query', function (done) {
  list.on('searchComplete', function () {
    const items = list.items || list.visibleItems || list.list || [];
    expect(items.length).toBeGreaterThan(0);

    const allMatchQuery = items.every(function (item) {
      const values = item.values ? item.values() : item;
      const text = (values && values.name) || (values && values.title) || String(values);
      return text.toLowerCase().includes('jon');
    });

    expect(allMatchQuery).toBe(true);
    done();
  });

  $('#parse-list .search').val('jon');
  fireKeyup($('#parse-list .search')[0]);
});