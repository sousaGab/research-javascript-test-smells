it('should not remove anything due to case sensitivity', function () {
      var count = list.remove('name', 'jonny')
      expect(count).toBe(0)
      expect(list.items.length).toEqual(1)
    })