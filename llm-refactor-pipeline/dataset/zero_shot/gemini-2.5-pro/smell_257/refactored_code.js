it('should be triggered after add', function (done) {
      list.on('updated', function (updatedList) {
        expect(updatedList.items).to.have.lengthOf(1);
        expect(updatedList.items[0].name).to.equal('Hej');
        done();
      });
      list.add({ name: 'Hej' });
    });