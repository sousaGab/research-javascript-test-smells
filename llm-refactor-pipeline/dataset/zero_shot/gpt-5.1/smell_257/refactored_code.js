it('should be triggered after add', function (done) {
  const item = { name: 'Hej' }

  list.on('updated', function (updatedList) {
    try {
      // Assert that the event is triggered with the expected list
      expect(updatedList).to.exist
      expect(updatedList).to.have.property('items')
      expect(updatedList.items).to.be.an('array')
      expect(updatedList.items[updatedList.items.length - 1]).to.deep.equal(item)
      done()
    } catch (err) {
      done(err)
    }
  })

  list.add(item)
})