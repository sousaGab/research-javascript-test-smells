it('should remove one item', function () {
  const expectedListLength = 2;
  const expectedRemoveCount = 1;
  const expectedFinalListLength = 1;

  list.add({ name: 'Jonas' });
  expect(list.items.length).toEqual(expectedListLength);
  var count = list.remove('name', 'Jonas');
  expect(count).toEqual(expectedRemoveCount);
  expect(list.items.length).toEqual(expectedFinalListLength);
});