// Your COMPLETE refactored test code here

it('should move a key with a size up', () => {
    const nodes = generateNodes(['a', '#1', '#2', '#3']);
    const template = (nodes) => {
        return `<div>${nodes.join('')}</div>`;
    };
    const container = document.createElement('div');
    const render = (template, container) => {
        container.innerHTML = template;
    };
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);
    render(template(generateNodes(['a', '#1', '#2', '#3'])), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);
    render(template(generateNodes(['a', '#1', '#2', '#4'])), container);
    expect(container.textContent).toBe('#0#1#2#4a#5');
    expect(container.firstChild.childNodes.length).toBe(6);
    render(template(generateNodes(['a', '#1', '#2', '#3'])), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);
})