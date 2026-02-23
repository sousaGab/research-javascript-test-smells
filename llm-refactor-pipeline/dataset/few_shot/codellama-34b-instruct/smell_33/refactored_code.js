// Your COMPLETE refactored test code here

it('should have default settings', function () {
  const pagination = getPagination();
  const pageLinks = pagination.find('a');
  const firstPageLink = pageLinks.get(0);
  const secondPageLink = pageLinks.get(1);
  const thirdPageLink = pageLinks.get(2);
  const fourthPageLink = pageLinks.get(3);
  const fifthPageLink = pageLinks.get(4);

  expect(pageLinks.length).toEqual(4);
  expect(firstPageLink.innerHTML).toEqual('1');
  expect(secondPageLink.innerHTML).toEqual('2');
  expect(thirdPageLink.innerHTML).toEqual('...');
  expect(fourthPageLink.innerHTML).toEqual('9');
  expect(fifthPageLink).toEqual(undefined);
});