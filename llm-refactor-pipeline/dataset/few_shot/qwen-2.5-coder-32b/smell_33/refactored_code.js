it('should have default settings', function () {
  const TOTAL_LINKS = 4;
  const FIRST_PAGE = '1';
  const SECOND_PAGE = '2';
  const ELLIPSIS = '...';
  const LAST_PAGE = '9';
  const OUT_OF_BOUNDS_INDEX = 4;

  expect(pagination.find('a').length).toEqual(TOTAL_LINKS);
  expect(pagination.find('a').get(0).innerHTML).toEqual(FIRST_PAGE);
  expect(pagination.find('a').get(1).innerHTML).toEqual(SECOND_PAGE);
  expect(pagination.find('a').get(2).innerHTML).toEqual(ELLIPSIS);
  expect(pagination.find('a').get(3).innerHTML).toEqual(LAST_PAGE);
  expect(pagination.find('a').get(OUT_OF_BOUNDS_INDEX)).toEqual(undefined);
});