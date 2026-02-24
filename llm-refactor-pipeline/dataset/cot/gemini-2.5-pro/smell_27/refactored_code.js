it('should remove one item', function () {
      const itemToAdd = { name: 'Jonas' };
      const EXPECTED_LENGTH_AFTER_ADD = 2;
      const EXPECTED_REMOVED_COUNT = 1;
      const FINAL_EXPECTED_LENGTH = 1;

      list.add(itemToAdd);
      expect(list.items.length).toEqual(EXPECTED_LENGTH_AFTER_ADD);

      const removedCount = list.remove('name', itemToAdd.name);

      expect(removedCount).toEqual(EXPECTED_REMOVED_COUNT);
      expect(list.items.length).toEqual(FINAL_EXPECTED_LENGTH);
    });