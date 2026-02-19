it('should remove one item', function () {
      const initialItemCount = 1
      const expectedFinalCount = 1
      const itemsToRemove = 1
      
      list.add({ name: 'Jonas' })
      expect(list.items.length).toEqual(initialItemCount + 1)
      var count = list.remove('name', 'Jonas')
      expect(count).toEqual(itemsToRemove)
      expect(list.items.length).toEqual(expectedFinalCount)
    })