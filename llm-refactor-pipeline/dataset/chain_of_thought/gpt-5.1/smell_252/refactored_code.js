it('should trigger sortComplete and update list order', function (done) {
  const originalOrder = list.items.map(item => item.name)

  list.on('sortComplete', function () {
    const sortedOrder = list.items.map(item => item.name)

    expect(sortedOrder).not.toEqual(originalOrder)
    const manuallySorted = [...originalOrder].sort()
    expect(sortedOrder).toEqual(manuallySorted)

    done()
  })

  fireClick($('#sort-name')[0])
})