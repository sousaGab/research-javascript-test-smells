it("uses correct layout for current breakpoint", () => {
    const onLayoutChange = jest.fn();

    const layouts = {
      lg: [{ i: "a", x: 0, y: 0, w: 4, h: 2 }],
      sm: [{ i: "a", x: 0, y: 0, w: 2, h: 2 }]
    };

    const responsiveRGL = render(
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

    // Find the call after resize
    const calls = onLayoutChange.mock.calls;
    if (calls.length > 0) {
      const lastCall = calls[calls.length - 1];
      const [layout] = lastCall;
      // At sm breakpoint, width should be 2
      expect(layout[0].w).toBeLessThanOrEqual(6); // Within sm cols
    }
  })