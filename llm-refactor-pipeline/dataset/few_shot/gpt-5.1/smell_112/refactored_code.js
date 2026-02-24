function verifyClassIsSetToShow(element) {
  element.setAttribute('class', 'show');
  expect(element.getAttribute('class')).toBe('show');
}

function verifyClassIsRemoved(element) {
  classes(element).remove('show');
  expect(element.getAttribute('class')).toBe('');
}

it('should remove the show class from the element', function removeShowClassFromElement() {
  verifyClassIsSetToShow(el);
  verifyClassIsRemoved(el);
});