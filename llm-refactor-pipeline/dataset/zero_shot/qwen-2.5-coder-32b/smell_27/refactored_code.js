it('should remove one item', function () {
      const initialItemCount = 1
      const expectedItemCountAfterAdd = 2
      const itemsRemoved = 1
      const expectedItemCountAfterRemove = 1
      
      list.add({ name: 'Jonas' })
      expect(list.items.length).toEqual(expectedItemCountAfterAdd)
      var count = list.remove('name', 'Jonas')
      expect(count).toEqual(itemsRemoved)
      expect(list.items.length).toEqual(expectedItemCountAfterRemove)
    })