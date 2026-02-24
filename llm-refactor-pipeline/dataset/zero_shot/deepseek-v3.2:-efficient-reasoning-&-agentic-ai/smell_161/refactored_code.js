it("onBreakpointChange provides breakpoint name and cols count", () => {
    const onBreakpointChange = jest.fn();

    render(
      <ResponsiveRGL
        layouts={{ lg: [{ i: "a", x: 0, y: 0, w: 4, h: 2 }] }}
        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
        cols={{ lg: 12, md: 10, sm: 6 }}
        onBreakpointChange={onBreakpointChange}
      >
        <div key="a">A</div>
      </ResponsiveRGL>
    );

    act(() => {
      global.triggerResize(1000, 600);
    });

    expect(onBreakpointChange).toHaveBeenCalledWith("md", 10);
  })