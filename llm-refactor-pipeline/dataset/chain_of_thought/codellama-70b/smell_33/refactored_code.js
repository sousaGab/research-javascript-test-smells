it('should have default settings', function () {
  const EXPECTED_PAGINATION_LENGTH = 4;
  const EXPECTED_PAGINATION_FIRST_PAGE = '1';
  const EXPECTED_PAGINATION_SECOND_PAGE = '2';
  const EXPECTED_PAGINATION_LAST_PAGE = '9';

  expect(pagination.find('a').length).toEqual(EXPECTED_PAGINATION_LENGTH);
  expect(pagination.find('a').get(0).innerHTML).toEqual(EXPECTED_PAGINATION_FIRST_PAGE);
  expect(pagination.find('a').get(1).innerHTML).toEqual(EXPECTED_PAGINATION_SECOND_PAGE);
  expect(pagination.find('a').get(2).innerHTML).toEqual('...');
  expect(pagination.find('a').get(3).innerHTML).toEqual(EXPECTED_PAGINATION_LAST_PAGE);
  expect(pagination.find('a').get(4)).toEqual(undefined);
});