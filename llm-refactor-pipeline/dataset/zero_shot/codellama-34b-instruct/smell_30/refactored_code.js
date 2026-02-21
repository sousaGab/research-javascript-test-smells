it('should contain one item', function () {
      expect(list.items.length).toEqual(1)
      expect(listEl.find('tr').length).toEqual(list.items.length)
    })