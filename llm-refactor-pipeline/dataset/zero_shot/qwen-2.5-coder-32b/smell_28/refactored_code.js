it('should not remove anything due to case sensitivity', function () {
  const itemName = 'jonny'
  const expectedCount = 0
  const expectedLength = 1
  
  var count = list.remove('name', itemName)
  expect(count).toBe(expectedCount)
  expect(list.items.length).toEqual(expectedLength)
})