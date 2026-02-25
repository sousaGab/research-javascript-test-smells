it('should remove eight items', function () {
      const NAME_TO_REMOVE = 'Jonny';
      const EXPECTED_REMOVED_COUNT = 8;
      const EXPECTED_REMAINING_COUNT = 2;
      const TOTAL_INITIAL_ITEMS = EXPECTED_REMOVED_COUNT + EXPECTED_REMAINING_COUNT;

      // Arrange: The original test implies one item with the name 'Jonny' already exists.
      // We add 7 more to reach the total of 8.
      const jonnysToAdd = EXPECTED_REMOVED_COUNT - 1;
      for (let i = 0; i < jonnysToAdd; i++) {
        list.add({ name: NAME_TO_REMOVE });
      }
      list.add({ name: 'Sven' });
      list.add({ name: 'Jonas' });

      expect(list.items.length).toEqual(TOTAL_INITIAL_ITEMS);

      // Act
      const removedCount = list.remove('name', NAME_TO_REMOVE);

      // Assert
      expect(removedCount).toEqual(EXPECTED_REMOVED_COUNT);
      expect(list.items.length).toEqual(EXPECTED_REMAINING_COUNT);
    });