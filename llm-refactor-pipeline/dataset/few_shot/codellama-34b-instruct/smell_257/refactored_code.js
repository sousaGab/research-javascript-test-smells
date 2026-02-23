// Your COMPLETE refactored test code here
it('should be triggered after add', function (done) {
      list.on('updated', function (list) {
        expect(list.length).toBe(1);
        expect(list[0].name).toBe('Hej');
        done()
      })
      list.add({ name: 'Hej' })
    })