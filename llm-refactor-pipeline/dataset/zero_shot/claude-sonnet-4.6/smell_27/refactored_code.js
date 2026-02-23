it('should remove one item', function () {
      const initialItemCount = 1;
      const addedItemCount = 1;
      const expectedTotalCount = initialItemCount + addedItemCount;
      const expectedRemovedCount = 1;
      const expectedRemainingCount = initialItemCount;

      list.add({ name: 'Jonas' })
      expect(list.items.length).toEqual(expectedTotalCount)
      var count = list.remove('name', 'Jonas')
      expect(count).toEqual(expectedRemovedCount)
      expect(list.items.length).toEqual(expectedRemainingCount)
    })