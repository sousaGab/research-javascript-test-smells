it('should remove', () => {
  el.setAttribute('class', 'show')
  expect(el.getAttribute('class')).toBe('show')
  classes(el).remove('show')
  expect(el.getAttribute('class')).toBe('')
})