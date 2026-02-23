it('should remove all items with the name "Jonny"', function () {
    const jonny = { name: 'Jonny' };
    const sven = { name: 'Sven' };
    const jonas = { name: 'Jonathan' };
    list.add(jonny);
    list.add(jonny);
    list.add(sven);
    list.add(jonny);
    list.add(jonny);
    list.add(jonny);
    list.add(jonas);
    list.add(jonny);
    list.add(jonny);
    expect(list.items.length).toEqual(10);
    const count = list.remove('name', 'Jonny');
    expect(count).toEqual(8);
    expect(list.items.length).toEqual(2);
});