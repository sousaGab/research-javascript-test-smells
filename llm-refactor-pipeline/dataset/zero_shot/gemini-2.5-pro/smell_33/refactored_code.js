it('should have default settings', function () {
  const expectedPageLinks = ['1', '2', '...', '9'];
  const pageLinks = pagination.find('a');
  const actualPageLinkTexts = pageLinks.map((i, el) => el.innerHTML).get();

  expect(pageLinks.length).toEqual(expectedPageLinks.length);
  expect(actualPageLinkTexts).toEqual(expectedPageLinks);
});