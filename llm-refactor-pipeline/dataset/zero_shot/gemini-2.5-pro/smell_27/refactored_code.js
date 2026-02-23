it('should remove one item', function () {
      const itemToAdd = { name: 'Jonas' };
      const initialItemCount = list.items.length;
      
      list.add(itemToAdd);
      const itemCountAfterAdd = initialItemCount + 1;
      expect(list.items.length).toEqual(itemCountAfterAdd);

      const expectedRemovedCount = 1;
      const actualRemovedCount = list.remove('name', itemToAdd.name);
      expect(actualRemovedCount).toEqual(expectedRemovedCount);

      const finalItemCount = itemCountAfterAdd - expectedRemovedCount;
      expect(list.items.length).toEqual(finalItemCount);
    })