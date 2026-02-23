// Your COMPLETE refactored test code here
it('should have default settings', function () {
  const LINK_SELECTOR = 'a';
  const EXPECTED_LINK_COUNT = 4;

  const FIRST_LINK_INDEX = 0;
  const SECOND_LINK_INDEX = 1;
  const ELLIPSIS_LINK_INDEX = 2;
  const LAST_LINK_INDEX = 3;
  const OUT_OF_RANGE_LINK_INDEX = 4;

  const FIRST_PAGE_LABEL = '1';
  const SECOND_PAGE_LABEL = '2';
  const ELLIPSIS_LABEL = '...';
  const LAST_PAGE_LABEL = '9';

  const links = pagination.find(LINK_SELECTOR);

  expect(links.length).toEqual(EXPECTED_LINK_COUNT);
  expect(links.get(FIRST_LINK_INDEX).innerHTML).toEqual(FIRST_PAGE_LABEL);
  expect(links.get(SECOND_LINK_INDEX).innerHTML).toEqual(SECOND_PAGE_LABEL);
  expect(links.get(ELLIPSIS_LINK_INDEX).innerHTML).toEqual(ELLIPSIS_LABEL);
  expect(links.get(LAST_LINK_INDEX).innerHTML).toEqual(LAST_PAGE_LABEL);
  expect(links.get(OUT_OF_RANGE_LINK_INDEX)).toEqual(undefined);
});