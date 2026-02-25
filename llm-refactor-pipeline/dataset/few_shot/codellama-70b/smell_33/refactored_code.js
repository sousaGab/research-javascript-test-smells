it('should have default settings', function () {
  const DEFAULT_PAGINATION_LENGTH = 4;
  const FIRST_PAGE_NUMBER = 1;
  const SECOND_PAGE_NUMBER = 2;
  const LAST_PAGE_NUMBER = 9;

  expect(pagination.find('a').length).toEqual(DEFAULT_PAGINATION_LENGTH);
  expect(pagination.find('a').get(0).innerHTML).toEqual(FIRST_PAGE_NUMBER.toString());
  expect(pagination.find('a').get(1).innerHTML).toEqual(SECOND_PAGE_NUMBER.toString());
  expect(pagination.find('a').get(2).innerHTML).toEqual('...');
  expect(pagination.find('a').get(3).innerHTML).toEqual(LAST_PAGE_NUMBER.toString());
  expect(pagination.find('a').get(4)).toEqual(undefined);
});