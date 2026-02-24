it('should be triggered after add', function (done) {
      list.on('updated', function (updatedList) {
        expect(updatedList.items).toHaveLength(1);
        expect(updatedList.items[0].values().name).toBe('Hej');
        done();
      });
      list.add({ name: 'Hej' });
    });