it('should contain two items', function () {
  list.add({ name: 'Jonas' })
  const EXPECTED_ITEMS_LENGTH = 2
  expect(list.items.length).toEqual(EXPECTED_ITEMS_LENGTH)
  expect(listEl.find('li').length).toEqual(EXPECTED_ITEMS_LENGTH)
})