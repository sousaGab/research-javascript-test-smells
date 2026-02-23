describe('render', () => {
  it('should render a div element', () => {
    const f = document.createDocumentFragment();
    const a = createElement('div', null, 'cde');
    render(a, f);
    expect(f.firstChild.tagName).toBe('DIV');
  });

  it('should render a nested div element', () => {
    const f = document.createDocumentFragment();
    const a = createElement('div', null, createElement('div', null));
    render(a, f);
    expect(f.firstChild.firstChild.tagName).toBe('DIV');
  });
});