it('should trigger searchComplete and update results correctly', function (done) {
  list.on('searchComplete', function (results) {
    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBeGreaterThan(0)
    results.forEach(function (item) {
      expect(item.name.toLowerCase()).toContain('angelica')
    })
    done()
  })

  $('#list-fuzzy-search .fuzzy-search').val('angelica')
  fireKeyup($('#list-fuzzy-search .fuzzy-search')[0])
})