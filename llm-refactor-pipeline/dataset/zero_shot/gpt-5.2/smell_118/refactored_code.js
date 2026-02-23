test('renders hover details correctly', () => {
  const element = document.createElement('div');
  const graph = createTestGraph(element);

  const onShow = jest.fn();
  const onHide = jest.fn();
  const onRender = jest.fn();

  const hoverDetail = new Rickshaw.Graph.HoverDetail({
    graph,
    onShow,
    onHide,
    onRender,
  });

  const selectAll = (selector) => d3.select(element).selectAll(selector);
  const count = (selection) => selection[0].length;
  const firstNode = (selection) => selection[0][0];

  const expectCount = (selector, expected) => {
    expect(count(selectAll(selector))).toBe(expected);
  };

  const expectFirstInnerHTML = (selector, expected) => {
    expect(firstNode(selectAll(selector)).innerHTML).toBe(expected);
  };

  const renderWithPoints = (points) => hoverDetail.render({ points });

  renderWithPoints([
    {
      active: true,
      series: graph.series[0],
      value: { y: null },
    },
  ]);

  expectCount('.item', 0);
  expect(onRender).not.toHaveBeenCalled();

  renderWithPoints([
    {
      active: true,
      series: graph.series[0],
      value: graph.series[0].data[0],
      formattedXValue: '4 foo',
      formattedYValue: '32 bar',
    },
    {
      active: true,
      series: graph.series[0],
      value: graph.series[0].data[1],
    },
    {
      active: true,
      series: graph.series[0],
      value: { y: null },
    },
  ]);

  expect(onShow).toHaveBeenCalledTimes(1);
  expect(onRender).toHaveBeenCalledTimes(1);

  expectCount('.x_label', 1);
  expectFirstInnerHTML('.x_label', '4 foo');

  expectCount('.item', 1);
  expectFirstInnerHTML('.item', 'testseries:&nbsp;32 bar');

  expectCount('.dot', 1);

  hoverDetail.hide();
  expect(onHide).toHaveBeenCalledTimes(1);

  element.remove();
});