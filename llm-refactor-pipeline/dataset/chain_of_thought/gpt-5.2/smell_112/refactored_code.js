it('should remove a class from the element', function () {
  const classToRemove = 'show'

  el.setAttribute('class', classToRemove)
  expect(el.getAttribute('class')).toBe(classToRemove)

  classes(el).remove(classToRemove)
  expect(el.getAttribute('class')).toBe('')
})