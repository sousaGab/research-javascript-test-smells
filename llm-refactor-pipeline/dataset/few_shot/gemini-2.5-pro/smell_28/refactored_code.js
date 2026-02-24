it('should not remove anything due to case sensitivity', function () {
      const VALUE_TO_REMOVE_WITH_WRONG_CASE = 'jonny';
      const EXPECTED_REMOVED_COUNT = 0;
      const EXPECTED_LIST_SIZE = 1;

      var count = list.remove('name', VALUE_TO_REMOVE_WITH_WRONG_CASE);

      expect(count).toBe(EXPECTED_REMOVED_COUNT);
      expect(list.items.length).toEqual(EXPECTED_LIST_SIZE);
    })