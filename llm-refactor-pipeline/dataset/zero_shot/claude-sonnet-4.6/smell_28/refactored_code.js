it('should not remove anything due to case sensitivity', function () {
      const EXPECTED_REMOVE_COUNT = 0;
      const EXPECTED_LIST_LENGTH = 1;
      var count = list.remove('name', 'jonny')
      expect(count).toBe(EXPECTED_REMOVE_COUNT)
      expect(list.items.length).toEqual(EXPECTED_LIST_LENGTH)
    })