describe('Rickshaw.Graph.HoverDetail', () => {
  let element;
  let graph;
  let onShow;
  let onHide;
  let onRender;
  let hoverDetail;

  beforeEach(() => {
    element = document.createElement('div');
    graph = createTestGraph(element);

    onShow = jest.fn();
    onHide = jest.fn();
    onRender = jest.fn();

    hoverDetail = new Rickshaw.Graph.HoverDetail({
      graph,
      onShow,
      onHide,
      onRender,
    });
  });

  afterEach(() => {
    element.remove();
  });

  test('does not render or call onRender when value is null', () => {
    hoverDetail.render({
      points: [{
        active: true,
        series: graph.series[0],
        value: {
          y: null
        },
      }, ],
    });

    const items = d3.select(element).selectAll('.item');
    expect(items.empty()).toBe(true);
    expect(onRender).not.toHaveBeenCalled();
  });

  test('renders details correctly for the first active point', () => {
    hoverDetail.render({
      points: [{
        active: true,
        series: graph.series[0],
        value: graph.series[0].data[0],
        formattedXValue: '4 foo',
        formattedYValue: '32 bar',
      }, {
        active: true,
        series: graph.series[0],
        value: graph.series[0].data[1],
      }, {
        active: true,
        series: graph.series[0],
        value: {
          y: null
        },
      }, ],
    });

    expect(onShow).toHaveBeenCalledTimes(1);
    expect(onRender).toHaveBeenCalledTimes(1);

    const xLabel = d3.select(element).select('.x_label');
    expect(xLabel.html()).toBe('4 foo');

    const item = d3.select(element).select('.item');
    expect(item.html()).toBe('testseries:&nbsp;32 bar');

    const dots = d3.select(element).selectAll('.dot');
    expect(dots.size()).toBe(1);
  });

  test('calls onHide when hide is invoked', () => {
    hoverDetail.render({
      points: [{
        active: true,
        series: graph.series[0],
        value: graph.series[0].data[0],
      }, ],
    });

    hoverDetail.hide();

    expect(onHide).toHaveBeenCalledTimes(1);
  });
});