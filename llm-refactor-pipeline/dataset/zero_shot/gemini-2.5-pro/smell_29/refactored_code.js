it('should contain two items', function () {
      const expectedItemCount = 2;
      list.add({ name: 'Jonas' });
      expect(list.items.length).toEqual(expectedItemCount);
      expect(listEl.find('li').length).toEqual(expectedItemCount);
    });