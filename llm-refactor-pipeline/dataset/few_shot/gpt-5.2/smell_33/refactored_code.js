it('should have default settings', function () {
  const EXPECTED_LINK_COUNT = 4

  const FIRST_LINK_INDEX = 0
  const SECOND_LINK_INDEX = 1
  const THIRD_LINK_INDEX = 2
  const FOURTH_LINK_INDEX = 3
  const FIFTH_LINK_INDEX = 4

  const FIRST_LINK_LABEL = '1'
  const SECOND_LINK_LABEL = '2'
  const THIRD_LINK_LABEL = '...'
  const FOURTH_LINK_LABEL = '9'

  const links = pagination.find('a')

  expect(links.length).toEqual(EXPECTED_LINK_COUNT)
  expect(links.get(FIRST_LINK_INDEX).innerHTML).toEqual(FIRST_LINK_LABEL)
  expect(links.get(SECOND_LINK_INDEX).innerHTML).toEqual(SECOND_LINK_LABEL)
  expect(links.get(THIRD_LINK_INDEX).innerHTML).toEqual(THIRD_LINK_LABEL)
  expect(links.get(FOURTH_LINK_INDEX).innerHTML).toEqual(FOURTH_LINK_LABEL)
  expect(links.get(FIFTH_LINK_INDEX)).toEqual(undefined)
})