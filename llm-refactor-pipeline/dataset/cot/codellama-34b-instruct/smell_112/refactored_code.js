it('should remove the "show" class', function () {
    el.setAttribute('class', 'show')
    expect(el.classList.contains('show')).toBe(true)
    classes(el).remove('show')
    expect(el.classList.contains('show')).toBe(false)
  })