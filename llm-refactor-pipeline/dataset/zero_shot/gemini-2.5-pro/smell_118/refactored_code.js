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

    // Test render with null value
    hoverDetail.render({
      points: [{
        active: true,
        series: graph.series[0],
        value: { y: null }
      }]
    });

    expect(element.querySelector('.item')).toBeNull();
    expect(onRender).not.toHaveBeenCalled();

    // Test render with multiple points
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

    const xLabel = element.querySelector('.x_label');
    expect(xLabel).not.toBeNull();
    expect(xLabel.innerHTML).toBe('4 foo');

    const item = element.querySelector('.item');
    expect(item).not.toBeNull();
    expect(item.innerHTML).toBe('testseries:&nbsp;32 bar');

    expect(element.querySelector('.dot')).not.toBeNull();

    // Test hide functionality
    hoverDetail.hide();
    expect(onHide).toHaveBeenCalledTimes(1);

    // Clean up
    element.remove();
  });