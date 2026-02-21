it('should remove class attribute when remove is called', function () {
    el.setAttribute('class', 'show')
    expect(el.getAttribute('class')).toBe('show')
    classes(el).remove('show')
    expect(el.getAttribute('class')).toBe('')
  })