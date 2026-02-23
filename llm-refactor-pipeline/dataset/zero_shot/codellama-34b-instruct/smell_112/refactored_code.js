// Your COMPLETE refactored test code here
it('should remove', function () {
    const el = document.createElement('div');
    el.setAttribute('class', 'show');
    expect(el.getAttribute('class')).toBe('show');
    classes(el).remove('show');
    expect(el.getAttribute('class')).toBe('');
  })