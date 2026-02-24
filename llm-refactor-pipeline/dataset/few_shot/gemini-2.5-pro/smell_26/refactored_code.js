it('should remove eight items', function () {
      const NAME_TO_REMOVE = 'Jonny';
      const ADDED_JONNYS_COUNT = 7;
      const ADDED_OTHERS_COUNT = 2;

      // Assuming one pre-existing item from setup, which is also a 'Jonny'
      const PRE_EXISTING_JONNY_COUNT = 1;

      const TOTAL_ITEMS_TO_REMOVE = ADDED_JONNYS_COUNT + PRE_EXISTING_JONNY_COUNT;
      const TOTAL_ITEMS_AT_START = TOTAL_ITEMS_TO_REMOVE + ADDED_OTHERS_COUNT;
      const REMAINING_ITEMS_COUNT = ADDED_OTHERS_COUNT;

      list.add({ name: NAME_TO_REMOVE });
      list.add({ name: NAME_TO_REMOVE });
      list.add({ name: 'Sven' });
      list.add({ name: NAME_TO_REMOVE });
      list.add({ name: NAME_TO_REMOVE });
      list.add({ name: NAME_TO_REMOVE });
      list.add({ name: 'Jonas' });
      list.add({ name: NAME_TO_REMOVE });
      list.add({ name: NAME_TO_REMOVE });

      expect(list.items.length).toEqual(TOTAL_ITEMS_AT_START);

      var removedCount = list.remove('name', NAME_TO_REMOVE);

      expect(removedCount).toEqual(TOTAL_ITEMS_TO_REMOVE);
      expect(list.items.length).toEqual(REMAINING_ITEMS_COUNT);
    });