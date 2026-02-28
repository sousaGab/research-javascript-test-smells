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

  it('should not render or call onRender for points with null y-values', () => {
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
    expect(items[0].length).toBe(0);
    expect(onRender).not.toHaveBeenCalled();
  });

  it('should render details and call callbacks for valid data points', () => {
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

    const xLabel = d3.select(element).selectAll('.x_label');
    expect(xLabel[0].length).toBe(1);
    expect(xLabel[0][0].innerHTML).toBe('4 foo');

    const items = d3.select(element).selectAll('.item');
    expect(items[0].length).toBe(1);
    expect(items[0][0].innerHTML).toBe('testseries:&nbsp;32 bar');

    const dots = d3.select(element).selectAll('.dot');
    expect(dots[0].length).toBe(1);
  });

  it('should call onHide when hide is invoked', () => {
    hoverDetail.hide();
    expect(onHide).toHaveBeenCalledTimes(1);
  });
});