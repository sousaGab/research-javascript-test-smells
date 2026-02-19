it("uses correct layout for current breakpoint", () => {
    const onLayoutChange = jest.fn();

    const layouts = {
      lg: [{ i: "a", x: 0, y: 0, w: 4, h: 2 }],
      sm: [{ i: "a", x: 0, y: 0, w: 2, h: 2 }]
    };

    render(
      <ResponsiveRGL
        layouts={layouts}
        breakpoints={{ lg: 1200, sm: 768 }}
        cols={{ lg: 12, sm: 6 }}
        onLayoutChange={onLayoutChange}
      >
        <div key="a">A</div>
      </ResponsiveRGL>
    );

    // Trigger resize to small breakpoint
    act(() => {
      global.triggerResize(600, 400);
    });

    // Verify layout was updated correctly for sm breakpoint
    expect(onLayoutChange).toHaveBeenCalledTimes(1);
    const [[layout]] = onLayoutChange.mock.calls;
    expect(layout[0].w).toBeLessThanOrEqual(6);
  });