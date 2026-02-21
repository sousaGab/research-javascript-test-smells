it('should contain two items', function () {
      list.add({ name: 'Jonas' })
      expect(list.items.length).toEqual(2)
      expect(listEl.find('li').length).toEqual(2)
    })