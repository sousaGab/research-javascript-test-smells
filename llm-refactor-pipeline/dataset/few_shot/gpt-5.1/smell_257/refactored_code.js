it('should be triggered after add', function (done) {
  list.on('updated', function (updatedList) {
    expect(updatedList).toBe(list)
    expect(updatedList.items || updatedList.length || updatedList.data).toBeDefined()
    done()
  })
  list.add({ name: 'Hej' })
})