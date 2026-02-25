it('should not remove anything due to case sensitivity', function () {
      const EXPECTED_REMOVED_COUNT = 0;
      const EXPECTED_ITEMS_REMAINING = 1;

      var count = list.remove('name', 'jonny');

      expect(count).toBe(EXPECTED_REMOVED_COUNT);
      expect(list.items.length).toEqual(EXPECTED_ITEMS_REMAINING);
    });