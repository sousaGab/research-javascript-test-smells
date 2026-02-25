it('should remove a single existing class from an element', function () {
    el.setAttribute('class', 'show')
    expect(el.getAttribute('class')).toBe('show')
    classes(el).remove('show')
    expect(el.getAttribute('class')).toBe('')
  })