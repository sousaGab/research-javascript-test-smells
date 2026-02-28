it('should be triggered after add, with the new item in the list', function (done) {
      list.on('updated', function (updatedList) {
        expect(updatedList.items.length).toBe(1);
        expect(updatedList.items[0].values().name).toBe('Hej');
        done();
      });
      list.add({ name: 'Hej' });
    });