it('should remove class from element', function () {
    el.setAttribute('class', 'show')
    expect(el.getAttribute('class')).toBe('show')
    classes(el).remove('show')
    expect(el.getAttribute('class')).toBe('')
})