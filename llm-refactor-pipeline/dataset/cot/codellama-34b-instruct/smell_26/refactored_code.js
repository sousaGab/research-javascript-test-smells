it('should remove eight items', function () {
      const JONNY_ITEM = { name: 'Jonny' };
      const JONAS_ITEM = { name: 'Jonny' };
      const JONAH_ITEM = { name: 'Jonny' };
      const JONAH_ITEM_COUNT = 8;
      const LIST_ITEM_COUNT = 10;

      list.add(JONNY_ITEM);
      list.add(JONNY_ITEM);
      list.add(JONAS_ITEM);
      list.add(JONNY_ITEM);
      list.add(JONNY_ITEM);
      list.add(JONNY_ITEM);
      list.add(JONAH_ITEM);
      list.add(JONNY_ITEM);
      list.add(JONNY_ITEM);
      expect(list.items.length).toEqual(LIST_ITEM_COUNT);
      var count = list.remove('name', 'Jonny');
      expect(count).toEqual(JONAH_ITEM_COUNT);
      expect(list.items.length).toEqual(2);
    })