it('should be triggered after add', function (done) {
      list.on('updated', function (updatedList) {
        expect(updatedList).to.exist;
        expect(updatedList).to.have.property('name', 'Hej');
        done();
      });
      list.add({ name: 'Hej' });
    })