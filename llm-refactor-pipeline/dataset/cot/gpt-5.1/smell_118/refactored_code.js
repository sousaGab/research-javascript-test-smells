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
    onRender
  });

  const getSelection = selector => d3.select(element).selectAll(selector);

  const renderHover = points =>
    hoverDetail.render({ points });

  const expectNoItemsAndNoRender = () => {
    const items = getSelection('.item');
    expect(items[0].length).toBe(0);
    expect(onRender).not.toHaveBeenCalled();
  };

  const expectRenderedDetails = () => {
    const xLabel = getSelection('.x_label');
    expect(xLabel[0].length).toBe(1);
    expect(xLabel[0][0].innerHTML).toBe('4 foo');

    const items = getSelection('.item');
    expect(items[0].length).toBe(1);
    expect(items[0][0].innerHTML).toBe('testseries:&nbsp;32 bar');

    const dots = getSelection('.dot');
    expect(dots[0].length).toBe(1);
  };

  // Test render with null value
  renderHover([
    {
      active: true,
      series: graph.series[0],
      value: { y: null }
    }
  ]);

  expectNoItemsAndNoRender();

  // Test render with multiple points
  renderHover([
    {
      active: true,
      series: graph.series[0],
      value: graph.series[0].data[0],
      formattedXValue: '4 foo',
      formattedYValue: '32 bar'
    },
    {
      active: true,
      series: graph.series[0],
      value: graph.series[0].data[1]
    },
    {
      active: true,
      series: graph.series[0],
      value: { y: null }
    }
  ]);

  expect(onShow).toHaveBeenCalledTimes(1);
  expect(onRender).toHaveBeenCalledTimes(1);

  expectRenderedDetails();

  // Test hide functionality
  hoverDetail.hide();
  expect(onHide).toHaveBeenCalledTimes(1);

  // Clean up
  element.remove();
});