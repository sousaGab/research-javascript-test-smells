const JONNY_COUNT = 8;
const JONAS_COUNT = 1;
const JONNY_NAME = 'Jonny';
const JONAS_NAME = 'Jonny';

it('should remove eight items', function () {
  list.add({ name: JONNY_NAME })
  list.add({ name: JONNY_NAME })
  list.add({ name: JONAS_NAME })
  list.add({ name: JONNY_NAME })
  list.add({ name: JONNY_NAME })
  list.add({ name: JONNY_NAME })
  list.add({ name: JONAS_NAME })
  list.add({ name: JONNY_NAME })
  list.add({ name: JONNY_NAME })
  expect(list.items.length).toEqual(10)
  var count = list.remove('name', JONNY_NAME)
  expect(count).toEqual(JONNY_COUNT)
  expect(list.items.length).toEqual(JONAS_COUNT)
})