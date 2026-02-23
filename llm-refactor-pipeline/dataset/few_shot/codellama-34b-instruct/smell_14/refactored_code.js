// Your COMPLETE refactored test code here

it('should update an node with static child and text', () => {
    const template = () =>
      createElement('div', null, createElement('div', null, 'Hello, World'));

    render(template(), container);
    expect(container.firstChild.innerHTML).toBe('<div>Hello, World</div>');

    render(template(), container);
    expect(container.firstChild.innerHTML).toBe('<div>Hello, World</div>');

    render(template(), container);
    expect(container.firstChild.innerHTML).toBe('<div>Hello, World</div>');
  })