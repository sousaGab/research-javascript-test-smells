it('should remove one item', function () {
      const ITEM_TO_ADD_AND_REMOVE = { name: 'Jonas' };
      const EXPECTED_LENGTH_AFTER_ADD = 2;
      const EXPECTED_REMOVED_COUNT = 1;
      const EXPECTED_FINAL_LENGTH = 1;

      list.add(ITEM_TO_ADD_AND_REMOVE);
      expect(list.items.length).toEqual(EXPECTED_LENGTH_AFTER_ADD);

      const removedCount = list.remove('name', ITEM_TO_ADD_AND_REMOVE.name);
      expect(removedCount).toEqual(EXPECTED_REMOVED_COUNT);
      expect(list.items.length).toEqual(EXPECTED_FINAL_LENGTH);
    });