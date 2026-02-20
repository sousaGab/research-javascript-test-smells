it('should have default settings', function () {
  const expectedLinks = [
    { href: '1', text: '1' },
    { href: '2', text: '2' },
    { href: '...', text: '...' },
    { href: '9', text: '9' },
  ];

  expect(pagination.find('a').length).toEqual(expectedLinks.length);

  expectedLinks.forEach((link, index) => {
    expect(pagination.find('a').get(index).innerHTML).toEqual(link.text);
  });
});