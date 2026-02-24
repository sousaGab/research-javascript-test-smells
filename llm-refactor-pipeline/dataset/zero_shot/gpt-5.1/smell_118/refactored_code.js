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

  const getItems = () => d3.select(element).selectAll('.item');
  const getXLabels = () => d3.select(element).selectAll('.x_label');
  const getDots = () => d3.select(element).selectAll('.dot');

  const renderWithPoints = (points) => hoverDetail.render({ points });

  const firstSeries = graph.series[0];

  // Test render with null value
  renderWithPoints([
    {
      active: true,
      series: firstSeries,
      value: { y: null }
    }
  ]);

  let items = getItems();
  expect(items[0].length).toBe(0);
  expect(onRender).not.toHaveBeenCalled();

  // Test render with multiple points
  renderWithPoints([
    {
      active: true,
      series: firstSeries,
      value: firstSeries.data[0],
      formattedXValue: '4 foo',
      formattedYValue: '32 bar'
    },
    {
      active: true,
      series: firstSeries,
      value: firstSeries.data[1]
    },
    {
      active: true,
      series: firstSeries,
      value: { y: null }
    }
  ]);

  expect(onShow).toHaveBeenCalledTimes(1);
  expect(onRender).toHaveBeenCalledTimes(1);

  const xLabel = getXLabels();
  expect(xLabel[0].length).toBe(1);
  expect(xLabel[0][0].innerHTML).toBe('4 foo');

  items = getItems();
  expect(items[0].length).toBe(1);
  expect(items[0][0].innerHTML).toBe('testseries:&nbsp;32 bar');

  const dots = getDots();
  expect(dots[0].length).toBe(1);

  // Test hide functionality
  hoverDetail.hide();
  expect(onHide).toHaveBeenCalledTimes(1);

  // Clean up
  element.remove();
});