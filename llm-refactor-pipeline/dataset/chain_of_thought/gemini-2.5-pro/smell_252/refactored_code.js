it('should sort by name on click and trigger sortComplete', function (done) {
  list.on('sortComplete', function () {
    // Assert that the list is now sorted by name in ascending order
    // Assuming initial names are e.g., 'Jonny', 'Duff', 'Jonas'
    expect(list.items[0].values().name).toBe('Duff');
    expect(list.items[list.items.length - 1].values().name).toBe('Jonny');
    done();
  });
  fireClick($('#sort-name')[0]);
});