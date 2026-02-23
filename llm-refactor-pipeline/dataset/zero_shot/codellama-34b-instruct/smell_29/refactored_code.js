// Your COMPLETE refactored test code here

describe('List', function () {
  it('should contain two items', function () {
    const list = new List();
    list.add({ name: 'Jonas' });
    expect(list.items.length).toEqual(2);
    expect(list.items[0].name).toEqual('Jonas');
    expect(list.items[1].name).toEqual('Jonas');
  });
});