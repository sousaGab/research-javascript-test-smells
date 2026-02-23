it('should be triggered after add', function (done) {
      list.on('updated', function (updatedList) {
        expect(updatedList).toBeDefined();
        expect(updatedList.length).toBeGreaterThan(0);
        const addedItem = updatedList[updatedList.length - 1];
        expect(addedItem.name).toBe('Hej');
        done();
      });
      list.add({ name: 'Hej' });
    })