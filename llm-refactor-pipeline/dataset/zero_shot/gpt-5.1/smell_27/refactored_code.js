it('should remove one item', function () {
  const initialItemCount = list.items.length
  const itemToAdd = { name: 'Jonas' }
  const expectedItemsAfterAdd = initialItemCount + 1
  const expectedRemovedCount = 1
  const expectedItemsAfterRemove = expectedItemsAfterAdd - expectedRemovedCount

  list.add(itemToAdd)
  expect(list.items.length).toEqual(expectedItemsAfterAdd)

  const removedCount = list.remove('name', itemToAdd.name)
  expect(removedCount).toEqual(expectedRemovedCount)
  expect(list.items.length).toEqual(expectedItemsAfterRemove)
})