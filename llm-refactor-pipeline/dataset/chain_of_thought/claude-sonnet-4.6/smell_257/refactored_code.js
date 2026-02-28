it('should be triggered after add', function (done) {
      list.on('updated', function (updatedList) {
        expect(updatedList).toBeDefined();
        expect(updatedList.length).toBe(1);
        expect(updatedList[0].name).toBe('Hej');
        done();
      });
      list.add({ name: 'Hej' });
    })