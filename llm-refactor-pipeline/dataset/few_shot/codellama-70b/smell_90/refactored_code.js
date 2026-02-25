it("uses default threshold of 3px when not specified (v2 API)", function () {
  const onDragStart = jest.fn();

  const { container } = render(
    <GridLayoutV2
      className="layout"
      gridConfig={{ cols: 12, rowHeight: 30 }}
      width={1200}
      layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
      dragConfig={{ enabled: true }} // No threshold specified, should use default 3
      onDragStart={onDragStart}
    >
      <div key="a">a</div>
    </GridLayoutV2>
  );

  const gridItem = container.querySelector(".react-grid-item");

  // Mousedown
  act(() => {
    dispatchMouseEvent(gridItem, "mousedown", {
      clientX: 50,
      clientY: 50
    });
  });

  // Move only 2px (less than default threshold of 3)
  act(() => {
    mouseMove(52, 50, gridItem);
  });

  // onDragStart should NOT have been called yet
  expect(onDragStart).not.toHaveBeenCalled();

  // Move another 2px (total 4px, exceeds default threshold of 3)
  act(() => {
    mouseMove(54, 50, gridItem);
  });

  // NOW onDragStart should have been called
  expect(onDragStart).toHaveBeenCalled();

  // Clean up
  act(() => {
    const mouseUpEvent = new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: 54,
      clientY: 50,
      button: 0
    });
    document.dispatchEvent(mouseUpEvent);
  });
});