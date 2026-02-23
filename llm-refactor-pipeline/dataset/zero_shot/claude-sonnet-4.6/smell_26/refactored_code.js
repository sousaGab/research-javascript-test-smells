it('should remove eight items', function () {
      const jonnyItems = [
        { name: 'Jonny' },
        { name: 'Jonny' },
        { name: 'Jonny' },
        { name: 'Jonny' },
        { name: 'Jonny' },
        { name: 'Jonny' },
        { name: 'Jonny' },
        { name: 'Jonny' }
      ]
      const otherItems = [
        { name: 'Sven' },
        { name: 'Jonas' }
      ]
      const jonnyCount = jonnyItems.length
      const otherCount = otherItems.length
      const totalCount = jonnyCount + otherCount

      jonnyItems.forEach(item => list.add(item))
      otherItems.forEach(item => list.add(item))

      expect(list.items.length).toEqual(totalCount)
      var count = list.remove('name', 'Jonny')
      expect(count).toEqual(jonnyCount)
      expect(list.items.length).toEqual(otherCount)
    })