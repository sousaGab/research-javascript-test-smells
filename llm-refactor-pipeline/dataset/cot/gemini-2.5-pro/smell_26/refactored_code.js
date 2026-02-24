it('should remove eight items', function () {
      const NAME_TO_REMOVE = 'Jonny';
      const ITEMS_TO_REMOVE_COUNT = 8;
      const REMAINING_ITEMS_COUNT = 2;
      const INITIAL_TOTAL_ITEMS = ITEMS_TO_REMOVE_COUNT + REMAINING_ITEMS_COUNT;

      list.add({ name: NAME_TO_REMOVE });
      list.add({ name: NAME_TO_REMOVE });
      list.add({ name: 'Sven' });
      list.add({ name: NAME_TO_REMOVE });
      list.add({ name: NAME_TO_REMOVE });
      list.add({ name: NAME_TO_REMOVE });
      list.add({ name: 'Jonas' });
      list.add({ name: NAME_TO_REMOVE });
      list.add({ name: NAME_TO_REMOVE });
      list.add({ name: NAME_TO_REMOVE });

      expect(list.items.length).toEqual(INITIAL_TOTAL_ITEMS);

      const removedCount = list.remove('name', NAME_TO_REMOVE);

      expect(removedCount).toEqual(ITEMS_TO_REMOVE_COUNT);
      expect(list.items.length).toEqual(REMAINING_ITEMS_COUNT);
    });