it('should remove one item', function () {
      list.add({ name: 'Jonas' })
      expect(list.items.length).toEqual(2)
      var count = list.remove(list.items[0])
      expect(count).toEqual(1)
      expect(list.items.length).toEqual(1)
    })