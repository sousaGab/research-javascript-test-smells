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

    hoverDetail.render({
      points: [{
        active: true,
        series: graph.series[0],
        value: { y: null }
      }]
    });

    expect(d3.select(element).selectAll('.item')[0].length).toBe(0);
    expect(onRender).not.toHaveBeenCalled();

    hoverDetail.render({
      points: [{
        active: true,
        series: graph.series[0],
        value: graph.series[0].data[0],
        formattedXValue: '4 foo',
        formattedYValue: '32 bar'
      }, {
        active: true,
        series: graph.series[0],
        value: graph.series[0].data[1]
      }, {
        active: true,
        series: graph.series[0],
        value: { y: null }
      }]
    });

    expect(onShow).toHaveBeenCalledTimes(1);
    expect(onRender).toHaveBeenCalledTimes(1);

    expect(d3.select(element).selectAll('.x_label')[0].length).toBe(1);
    expect(d3.select(element).selectAll('.x_label')[0][0].innerHTML).toBe('4 foo');

    expect(d3.select(element).selectAll('.item')[0].length).toBe(1);
    expect(d3.select(element).selectAll('.item')[0][0].innerHTML).toBe('testseries:&nbsp;32 bar');

    expect(d3.select(element).selectAll('.dot')[0].length).toBe(1);

    hoverDetail.hide();
    expect(onHide).toHaveBeenCalledTimes(1);

    element.remove();
  })