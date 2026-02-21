it('should not remove anything due to case sensitivity', function () {
      const expectedCount = 0;
      const expectedItemsLength = 1;
      const count = list.remove('name', 'jonny')
      expect(count).toBe(expectedCount)
      expect(list.items.length).toEqual(expectedItemsLength)
    })