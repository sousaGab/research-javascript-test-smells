it('should trigger updated event after add', function (done) {
      list.on('updated', function (list) {
        expect(list).to.exist;
        done()
      })
      list.add({ name: 'Hej' })
    })