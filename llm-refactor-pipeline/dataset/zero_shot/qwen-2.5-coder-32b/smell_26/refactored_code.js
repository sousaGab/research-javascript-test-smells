it('should remove eight items', function () {
      const numberOfItemsToAdd = 9
      const numberOfItemsToRemove = 8
      const expectedRemainingItems = 2
      
      list.add({ name: 'Jonny' })
      list.add({ name: 'Jonny' })
      list.add({ name: 'Sven' })
      list.add({ name: 'Jonny' })
      list.add({ name: 'Jonny' })
      list.add({ name: 'Jonny' })
      list.add({ name: 'Jonas' })
      list.add({ name: 'Jonny' })
      list.add({ name: 'Jonny' })
      expect(list.items.length).toEqual(numberOfItemsToAdd + 1)
      var count = list.remove('name', 'Jonny')
      expect(count).toEqual(numberOfItemsToRemove)
      expect(list.items.length).toEqual(expectedRemainingItems)
    })