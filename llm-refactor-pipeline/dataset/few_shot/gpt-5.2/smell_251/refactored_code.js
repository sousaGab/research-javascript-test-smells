it('should trigger searchComplete', function (done) {
  const handler = jest.fn(() => {
    expect(handler).toHaveBeenCalledTimes(1)
    list.off('searchComplete', handler)
    done()
  })

  list.on('searchComplete', handler)

  $('#parse-list .search').val('jon')
  fireKeyup($('#parse-list .search')[0])
})