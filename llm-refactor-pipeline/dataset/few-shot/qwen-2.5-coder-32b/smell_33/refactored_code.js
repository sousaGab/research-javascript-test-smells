const DEFAULT_PAGE_COUNT = 4
const FIRST_PAGE_TEXT = '1'
const SECOND_PAGE_TEXT = '2'
const ELLIPSIS_TEXT = '...'
const LAST_PAGE_TEXT = '9'

it('should have default settings', function () {
  expect(pagination.find('a').length).toEqual(DEFAULT_PAGE_COUNT)
  expect(pagination.find('a').get(0).innerHTML).toEqual(FIRST_PAGE_TEXT)
  expect(pagination.find('a').get(1).innerHTML).toEqual(SECOND_PAGE_TEXT)
  expect(pagination.find('a').get(2).innerHTML).toEqual(ELLIPSIS_TEXT)
  expect(pagination.find('a').get(3).innerHTML).toEqual(LAST_PAGE_TEXT)
  expect(pagination.find('a').get(4)).toEqual(undefined)
})