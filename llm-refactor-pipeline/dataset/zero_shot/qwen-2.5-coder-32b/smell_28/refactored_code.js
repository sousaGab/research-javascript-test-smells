it('should not remove anything due to case sensitivity', function () {
      const removalCount = list.remove('name', 'jonny')
      expect(removalCount).toBe(0)
      expect(list.items.length).toEqual(1)
    })