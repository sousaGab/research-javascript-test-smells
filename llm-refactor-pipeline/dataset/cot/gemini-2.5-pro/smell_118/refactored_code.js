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

    const query = (selector) => d3.select(element).selectAll(selector);

    // Test render with null value
    hoverDetail.render({
        points: [{
            active: true,
            series: graph.series[0],
            value: { y: null }
        }]
    });

    expect(query('.item').size()).toBe(0);
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

    expect(query('.x_label').size()).toBe(1);
    expect(query('.x_label').html()).toBe('4 foo');

    expect(query('.item').size()).toBe(1);
    expect(query('.item').html()).toBe('testseries:&nbsp;32 bar');

    expect(query('.dot').size()).toBe(1);

    // Test hide functionality
    hoverDetail.hide();
    expect(onHide).toHaveBeenCalledTimes(1);

    // Clean up
    element.remove();
});