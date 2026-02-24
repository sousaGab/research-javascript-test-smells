it('should be triggered after add', function (done) {
      list.on('updated', function (updatedList) {
        const lastItem = updatedList.items[updatedList.items.length - 1];
        expect(lastItem.name).toBe('Hej');
        done();
      });
      list.add({ name: 'Hej' });
    });