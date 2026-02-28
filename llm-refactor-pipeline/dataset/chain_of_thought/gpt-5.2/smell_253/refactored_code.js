it('should trigger searchComplete', function (done) {
  const handler = jest.fn(() => {
    expect(handler).toHaveBeenCalledTimes(1)
    done()
  })

  list.on('searchComplete', handler)

  const $input = $('#list-fuzzy-search .fuzzy-search')
  $input.val('angelica')
  expect($input.val()).toBe('angelica')

  fireKeyup($input[0])
})