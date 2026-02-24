it('should move a key with a size up', () => {
    // Test case with node '#3'
    render(template(generateNodes(['a', '#1', '#2', '#3'])), container);
    render(
      template(generateNodes(['#0', '#1', '#2', '#3', 'a', '#5'])),
      container,
    );
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    // Test case with node '#4'
    render(template(generateNodes(['a', '#1', '#2', '#4'])), container);
    render(
      template(generateNodes(['#0', '#1', '#2', '#4', 'a', '#5'])),
      container,
    );
    expect(container.textContent).toBe('#0#1#2#4a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    // Re-test with node '#3' to ensure stability after changes
    render(template(generateNodes(['a', '#1', '#2', '#3'])), container);
    render(
      template(generateNodes(['#0', '#1', '#2', '#3', 'a', '#5'])),
      container,
    );
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);
  })