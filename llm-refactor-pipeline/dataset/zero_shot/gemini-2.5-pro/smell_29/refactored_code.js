it('should contain two items', function () {
      const expectedNumberOfItems = 2;
      list.add({ name: 'Jonas' });
      expect(list.items.length).toEqual(expectedNumberOfItems);
      expect(listEl.find('li').length).toEqual(expectedNumberOfItems);
    });