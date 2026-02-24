it('should update an node with static child and text', () => {
    const template = () =>
      createElement('div', null, createElement('div', null, 'Hello, World'));

    // Initial render
    render(template(), container);
    // Re-render to test the update path
    render(template(), container);

    expect(container.firstChild.innerHTML).toBe('<div>Hello, World</div>');
  })