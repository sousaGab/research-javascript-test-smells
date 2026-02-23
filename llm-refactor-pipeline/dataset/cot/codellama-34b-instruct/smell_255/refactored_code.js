// Your COMPLETE refactored test code here
it('should be triggered before and after sort', function (done) {
    var done1 = false
    list.on('sortStart', function (list) {
        done1 = true
    })
    list.on('sortComplete', function (list) {
        if (done1) {
            done()
        }
    })
    list.sort('name')
    expect(list.length).toBe(3)
    expect(list[0].name).toBe('John')
    expect(list[1].name).toBe('Jane')
    expect(list[2].name).toBe('Jim')
})