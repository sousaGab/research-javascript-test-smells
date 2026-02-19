it('should move a key with a size up', () => {
    const nodes = ['a', '#1', '#2', '#3'];
    const expectedNodes = ['#0', '#1', '#2', '#3', 'a', '#5'];
    
    render(template(generateNodes(nodes)), container);
    render(template(generateNodes(expectedNodes)), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);
    
    render(template(generateNodes(nodes)), container);
    render(template(generateNodes(expectedNodes)), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);
    
    render(template(generateNodes(nodes)), container);
    render(template(generateNodes(expectedNodes)), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);
    
    render(template(generateNodes(nodes)), container);
    render(template(generateNodes(expectedNodes)), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);
    
    render(template(generateNodes(['a', '#1', '#2', '#4'])), container);
    render(template(generateNodes(['#0', '#1', '#2', '#4', 'a', '#5'])), container);
    expect(container.textContent).toBe('#0#1#2#4a#5');
    expect(container.firstChild.childNodes.length).toBe(6);
    
    render(template(generateNodes(nodes)), container);
    render(template(generateNodes(expectedNodes)), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);
  })