// Your COMPLETE refactored test code here
it('should have default settings', function () {
  const pagination = $(this.element).find('.pagination');
  const pageLinks = pagination.find('a');
  const defaultPageCount = 9;
  const defaultPageLinks = 4;

  expect(pageLinks.length).toEqual(defaultPageLinks);
  expect(pageLinks.get(0).innerHTML).toEqual('1');
  expect(pageLinks.get(1).innerHTML).toEqual('2');
  expect(pageLinks.get(2).innerHTML).toEqual('...');
  expect(pageLinks.get(3).innerHTML).toEqual(defaultPageCount.toString());
  expect(pageLinks.get(4)).toEqual(undefined);
})