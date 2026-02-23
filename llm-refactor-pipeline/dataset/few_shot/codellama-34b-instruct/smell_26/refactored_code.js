// Your COMPLETE refactored test code here

it('should remove eight items', function () {
  const list = new List();
  list.add({ name: 'Jonny' });
  list.add({ name: 'Jonny' });
  list.add({ name: 'Sven' });
  list.add({ name: 'Jonny' });
  list.add({ name: 'Jonny' });
  list.add({ name: 'Jonny' });
  list.add({ name: 'Jonas' });
  list.add({ name: 'Jonny' });
  list.add({ name: 'Jonny' });
  expect(list.items.length).toEqual(10);
  const count = list.remove('name', 'Jonny');
  expect(count).toEqual(8);
  expect(list.items.length).toEqual(2);
});