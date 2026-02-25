it('should remove one item', function () {
      const EXPECTED_LENGTH_AFTER_ADD = 2;
      const EXPECTED_REMOVED_COUNT = 1;
      const EXPECTED_FINAL_LENGTH = EXPECTED_LENGTH_AFTER_ADD - EXPECTED_REMOVED_COUNT;

      list.add({ name: 'Jonas' });
      expect(list.items.length).toEqual(EXPECTED_LENGTH_AFTER_ADD);

      const count = list.remove('name', 'Jonas');
      expect(count).toEqual(EXPECTED_REMOVED_COUNT);
      expect(list.items.length).toEqual(EXPECTED_FINAL_LENGTH);
    });