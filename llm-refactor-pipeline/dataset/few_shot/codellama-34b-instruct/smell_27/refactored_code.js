// Your COMPLETE refactored test code here

it('should remove one item', function () {
      const initialLength = list.items.length;
      const itemToRemove = { name: 'Jonas' };
      list.add(itemToRemove);
      expect(list.items.length).toEqual(initialLength + 1);
      const count = list.remove('name', itemToRemove.name);
      expect(count).toEqual(1);
      expect(list.items.length).toEqual(initialLength);
    })