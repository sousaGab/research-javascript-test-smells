it('should remove one item', function () {
      list.add({ name: 'Jonas' })
      expect(list.items.length).toEqual(2)
      const itemToRemove = { name: 'Jonas' }
      var count = list.remove(itemToRemove)
      expect(count).toEqual(1)
      expect(list.items.length).toEqual(1)
    })