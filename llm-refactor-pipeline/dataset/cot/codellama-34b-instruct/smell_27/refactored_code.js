it('should remove one item', function () {
      const initialItemCount = 2;
      const removedItemName = 'Jonas';
      const expectedRemovedItemCount = 1;
      const expectedItemCountAfterRemoval = 1;

      list.add({ name: removedItemName })
      expect(list.items.length).toEqual(initialItemCount)
      var count = list.remove('name', removedItemName)
      expect(count).toEqual(expectedRemovedItemCount)
      expect(list.items.length).toEqual(expectedItemCountAfterRemoval)
    })