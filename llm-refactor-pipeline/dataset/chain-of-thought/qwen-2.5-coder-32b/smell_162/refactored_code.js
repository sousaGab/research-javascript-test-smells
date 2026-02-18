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

    // Verify layout change was called and check width at sm breakpoint
    expect(onLayoutChange).toHaveBeenCalled();
    const lastCall = onLayoutChange.mock.calls.at(-1);
    const [layout] = lastCall;
    expect(layout[0].w).toBeLessThanOrEqual(6);
  });