it('should have default settings', function () {
  const paginationLinks = pagination.find('a');
  const expectedLinks = ['1', '2', '...', '9'];

  expect(paginationLinks.length).toEqual(expectedLinks.length);

  for (let i = 0; i < expectedLinks.length; i++) {
    expect(paginationLinks.get(i).innerHTML).toEqual(expectedLinks[i]);
  }

  expect(paginationLinks.get(expectedLinks.length)).toEqual(undefined);
});