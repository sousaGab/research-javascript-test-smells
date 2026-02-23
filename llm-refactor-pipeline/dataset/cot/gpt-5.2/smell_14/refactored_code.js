it('should update an node with static child and text', () => {
  const template = () =>
    createElement('div', null, createElement('div', null, 'Hello, World'));

  const expectRenderedHtml = () => {
    expect(container.firstChild.innerHTML).toBe('<div>Hello, World</div>');
  };

  render(template(), container);
  expectRenderedHtml();

  render(template(), container);
  expectRenderedHtml();

  render(template(), container);
  expectRenderedHtml();
});