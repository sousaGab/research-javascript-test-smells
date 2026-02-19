it('should remove eight items', function () {
      const numberOfItemsToAdd = 9
      const numberOfItemsToRemove = 8
      const expectedRemainingItems = 2
      
      for (let i = 0; i < numberOfItemsToAdd; i++) {
        list.add({ name: 'Jonny' })
      }
      list.add({ name: 'Sven' })
      list.add({ name: 'Jonas' })
      
      expect(list.items.length).toEqual(numberOfItemsToAdd + 2)
      const count = list.remove('name', 'Jonny')
      expect(count).toEqual(numberOfItemsToRemove)
      expect(list.items.length).toEqual(expectedRemainingItems)
    })