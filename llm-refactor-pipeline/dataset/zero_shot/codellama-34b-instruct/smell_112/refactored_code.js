describe('classes', function () {
  let el;

  beforeEach(function () {
    el = document.createElement('div');
    el.setAttribute('class', 'show');
  });

  it('should remove the "show" class', function () {
    classes(el).remove('show');
    expect(el.getAttribute('class')).toBe('');
  });
});