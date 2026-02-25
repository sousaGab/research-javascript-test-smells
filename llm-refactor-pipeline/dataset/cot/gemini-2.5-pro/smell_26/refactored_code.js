it('should remove eight items', function () {
      const NAME_TO_REMOVE = 'Jonny';
      const COUNT_OF_ITEMS_TO_REMOVE = 8;
      const COUNT_OF_ITEMS_TO_REMAIN = 2;
      const INITIAL_TOTAL_ITEMS = COUNT_OF_ITEMS_TO_REMOVE + COUNT_OF_ITEMS_TO_REMAIN;

      for (let i = 0; i < COUNT_OF_ITEMS_TO_REMOVE; i++) {
        list.add({ name: NAME_TO_REMOVE });
      }
      list.add({ name: 'Sven' });
      list.add({ name: 'Jonas' });

      expect(list.items.length).toEqual(INITIAL_TOTAL_ITEMS);

      const removedCount = list.remove('name', NAME_TO_REMOVE);

      expect(removedCount).toEqual(COUNT_OF_ITEMS_TO_REMOVE);
      expect(list.items.length).toEqual(COUNT_OF_ITEMS_TO_REMAIN);
    })