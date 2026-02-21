it('should contain one item', function () {
      const expectedItemCount = 1
      
      expect(list.items.length).toEqual(expectedItemCount)
      expect(listEl.find('tr').length).toEqual(expectedItemCount)
    })