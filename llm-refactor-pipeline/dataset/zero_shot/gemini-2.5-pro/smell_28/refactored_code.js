it('should not remove anything due to case sensitivity', function () {
      const NO_ITEMS_REMOVED = 0;
      const EXPECTED_LIST_SIZE = 1;
      
      var count = list.remove('name', 'jonny');
      
      expect(count).toBe(NO_ITEMS_REMOVED);
      expect(list.items.length).toEqual(EXPECTED_LIST_SIZE);
    });