it('should have default settings', function () {
  const EXPECTED_TOTAL_LINKS = 4
  const FIRST_PAGE_INDEX = 0
  const SECOND_PAGE_INDEX = 1
  const ELLIPSIS_INDEX = 2
  const LAST_PAGE_INDEX = 3
  const OUT_OF_RANGE_INDEX = 4

  const FIRST_PAGE_LABEL = '1'
  const SECOND_PAGE_LABEL = '2'
  const ELLIPSIS_LABEL = '...'
  const LAST_PAGE_LABEL = '9'

  const links = pagination.find('a')

  expect(links.length).toEqual(EXPECTED_TOTAL_LINKS)
  expect(links.get(FIRST_PAGE_INDEX).innerHTML).toEqual(FIRST_PAGE_LABEL)
  expect(links.get(SECOND_PAGE_INDEX).innerHTML).toEqual(SECOND_PAGE_LABEL)
  expect(links.get(ELLIPSIS_INDEX).innerHTML).toEqual(ELLIPSIS_LABEL)
  expect(links.get(LAST_PAGE_INDEX).innerHTML).toEqual(LAST_PAGE_LABEL)
  expect(links.get(OUT_OF_RANGE_INDEX)).toEqual(undefined)
})