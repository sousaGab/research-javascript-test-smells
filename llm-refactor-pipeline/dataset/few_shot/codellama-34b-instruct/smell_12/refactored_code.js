it('should reorder nodes', () => {
    const nodes = generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1']);
    const template = (nodes) => `
      <div>
        ${nodes.map((node) => `<div key="${node.key}">${node.value}</div>`).join('')}
      </div>
    `;
    const container = document.createElement('div');
    const render = (template, container) => {
      container.innerHTML = template;
    };
  
    render(template(nodes), container);
    expect(container.textContent).toBe('74326abcdef1');
    expect(container.firstChild.childNodes.length).toBe(8);
  
    render(template(nodes.reverse()), container);
    expect(container.textContent).toBe('1defabc64327');
    expect(container.firstChild.childNodes.length).toBe(8);
  
    render(template(nodes), container);
    expect(container.textContent).toBe('74326abcdef1');
    expect(container.firstChild.childNodes.length).toBe(8);
  })