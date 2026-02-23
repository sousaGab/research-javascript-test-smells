it('should remove eight items', function () {
      const JONNY_COUNT = 7;
      const SVEN_COUNT = 1;
      const JONAS_COUNT = 1;
      const INITIAL_ITEM_COUNT = 10;
      const EXPECTED_REMOVED_COUNT = 7;
      const EXPECTED_REMAINING_COUNT = 3;

      list.add({ name: 'Jonny' })
      list.add({ name: 'Jonny' })
      list.add({ name: 'Sven' })
      list.add({ name: 'Jonny' })
      list.add({ name: 'Jonny' })
      list.add({ name: 'Jonny' })
      list.add({ name: 'Jonas' })
      list.add({ name: 'Jonny' })
      list.add({ name: 'Jonny' })
      expect(list.items.length).toEqual(INITIAL_ITEM_COUNT)
      var count = list.remove('name', 'Jonny')
      expect(count).toEqual(EXPECTED_REMOVED_COUNT)
      expect(list.items.length).toEqual(EXPECTED_REMAINING_COUNT)
    })