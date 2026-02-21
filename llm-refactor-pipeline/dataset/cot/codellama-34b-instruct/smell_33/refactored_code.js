const DEFAULT_PAGE_COUNT = 9;
const DEFAULT_PAGE_RANGE = 4;

it('should have default settings', function () {
  const pagination = renderPagination();
  const pageLinks = pagination.find('a');

  expect(pageLinks.length).toEqual(DEFAULT_PAGE_COUNT);
  expect(pageLinks.get(0).innerHTML).toEqual('1');
  expect(pageLinks.get(1).innerHTML).toEqual('2');
  expect(pageLinks.get(2).innerHTML).toEqual('...');
  expect(pageLinks.get(3).innerHTML).toEqual('9');
  expect(pageLinks.get(DEFAULT_PAGE_RANGE)).toEqual(undefined);
})