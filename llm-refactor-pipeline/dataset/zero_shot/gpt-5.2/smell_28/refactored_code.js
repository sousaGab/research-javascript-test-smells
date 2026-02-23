it('should not remove anything due to case sensitivity', function () {
  var expectedRemovedCount = 0
  var expectedRemainingItemsCount = 1

  var count = list.remove('name', 'jonny')

  expect(count).toBe(expectedRemovedCount)
  expect(list.items.length).toEqual(expectedRemainingItemsCount)
})