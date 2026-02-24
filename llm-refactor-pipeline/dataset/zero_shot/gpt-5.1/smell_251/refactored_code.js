it('should trigger searchComplete and update the list results', function (done) {
  const initialItems = list.items ? list.items.slice() : [];

  list.on('searchComplete', function () {
    try {
      // Ensure the event was actually triggered by checking that
      // the list state has changed in response to the search.
      const filteredItems = list.items || [];

      // Basic expectations to avoid an "unknown test":
      // 1. The search should narrow down or at least define a result set.
      expect(filteredItems).to.be.an('array');
      expect(filteredItems.length).to.be.at.most(initialItems.length);

      // 2. At least one item should match the search term "jon"
      const hasMatchingItem = filteredItems.some(item => {
        const values = item.values ? item.values() : item;
        const text = (values && (values.name || values.title || values.toString())) || '';
        return typeof text === 'string' && text.toLowerCase().includes('jon');
      });
      expect(hasMatchingItem).to.be.true;

      done();
    } catch (err) {
      done(err);
    }
  });

  $('#parse-list .search').val('jon');
  fireKeyup($('#parse-list .search')[0]);
});