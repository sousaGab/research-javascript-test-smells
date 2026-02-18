it('should remove one item', function () {
      const initialCount = 1
      const expectedFinalCount = 1
      const itemsRemoved = 1
      
      list.add({ name: 'Jonas' })
      expect(list.items.length).toEqual(initialCount + 1)
      var count = list.remove('name', 'Jonas')
      expect(count).toEqual(itemsRemoved)
      expect(list.items.length).toEqual(expectedFinalCount)
    })