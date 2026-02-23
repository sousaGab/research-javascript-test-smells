it('should have default settings', function () {
  const EXPECTED_LINK_TEXTS = ['1', '2', '...', '9']
  const EXPECTED_LINK_COUNT = EXPECTED_LINK_TEXTS.length

  const links = pagination.find('a')

  expect(links.length).toEqual(EXPECTED_LINK_COUNT)

  EXPECTED_LINK_TEXTS.forEach((text, index) => {
    expect(links.get(index).innerHTML).toEqual(text)
  })

  expect(links.get(EXPECTED_LINK_COUNT)).toEqual(undefined)
})