it('should remove one item', function () {
  const initialCount = 1
  const expectedCountAfterAdd = 2
  const expectedCountAfterRemove = 1
  const itemsToRemove = 'name'
  const itemValue = 'Jonas'
  
  list.add({ name: itemValue })
  expect(list.items.length).toEqual(expectedCountAfterAdd)
  var count = list.remove(itemsToRemove, itemValue)
  expect(count).toEqual(1)
  expect(list.items.length).toEqual(expectedCountAfterRemove)
})