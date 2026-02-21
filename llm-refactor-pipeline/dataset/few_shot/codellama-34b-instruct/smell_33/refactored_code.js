const DEFAULT_SETTINGS = {
  pageCount: 9,
  currentPage: 1,
  pageSize: 4,
  pageRange: 2,
};

it('should have default settings', function () {
  const pagination = renderPagination(DEFAULT_SETTINGS);
  expect(pagination.find('a').length).toEqual(4);
  expect(pagination.find('a').get(0).innerHTML).toEqual('1');
  expect(pagination.find('a').get(1).innerHTML).toEqual('2');
  expect(pagination.find('a').get(2).innerHTML).toEqual('...');
  expect(pagination.find('a').get(3).innerHTML).toEqual('9');
  expect(pagination.find('a').get(4)).toEqual(undefined);
});