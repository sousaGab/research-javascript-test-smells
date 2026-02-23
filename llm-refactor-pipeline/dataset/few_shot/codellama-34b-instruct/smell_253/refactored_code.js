// Your COMPLETE refactored test code here
it('should trigger searchComplete', function (done) {
    list.on('searchComplete', function () {
        done()
    })
    $('#list-fuzzy-search .fuzzy-search').val('angelica')
    fireKeyup($('#list-fuzzy-search .fuzzy-search')[0])
    expect(list.searchComplete).toHaveBeenCalled();
})