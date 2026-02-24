it('should emit updated event with newly added item after add', function (done) {
  list.on('updated', function (updatedList) {
    try {
      expect(updatedList).toBeDefined()
      expect(Array.isArray(updatedList.items || updatedList)).toBe(true)

      const items = updatedList.items || updatedList
      const lastItem = items[items.length - 1]

      expect(lastItem).toBeDefined()
      expect(lastItem.name).toBe('Hej')

      done()
    } catch (error) {
      done(error)
    }
  })

  list.add({ name: 'Hej' })
})