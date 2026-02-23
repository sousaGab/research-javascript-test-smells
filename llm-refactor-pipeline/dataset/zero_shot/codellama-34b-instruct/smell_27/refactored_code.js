// Your COMPLETE refactored test code here

describe('list', function () {
  it('should remove one item', function () {
    const list = new List();
    list.add({ name: 'Jonas' });
    expect(list.items.length).toEqual(2);
    const count = list.remove('name', 'Jonas');
    expect(count).toEqual(1);
    expect(list.items.length).toEqual(1);
  });
});