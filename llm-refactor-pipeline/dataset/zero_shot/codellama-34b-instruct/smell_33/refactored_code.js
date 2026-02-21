const DEFAULT_PAGINATION_LENGTH = 4;
const DEFAULT_PAGINATION_START_INDEX = 0;
const DEFAULT_PAGINATION_END_INDEX = 3;
const DEFAULT_PAGINATION_ELLIPSIS_INDEX = 2;

it('should have default settings', function () {
  expect(pagination.find('a').length).toEqual(DEFAULT_PAGINATION_LENGTH);
  expect(pagination.find('a').get(DEFAULT_PAGINATION_START_INDEX).innerHTML).toEqual('1');
  expect(pagination.find('a').get(DEFAULT_PAGINATION_END_INDEX).innerHTML).toEqual('9');
  expect(pagination.find('a').get(DEFAULT_PAGINATION_ELLIPSIS_INDEX).innerHTML).toEqual('...');
  expect(pagination.find('a').get(DEFAULT_PAGINATION_LENGTH)).toEqual(undefined);
})