it("does not cause item to jump on drag start with default positionStrategy", function () {
  const GRID_TOP_OFFSET = 500;
  const onDrag = jest.fn();
  const onDragStart = jest.fn();

  const { container } = render(
    <GridLayoutV2
      className="layout"
      gridConfig={{ cols: 12, rowHeight: 30, margin: [10, 10] }}
      width={1200}
      layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
      dragConfig={{ enabled: true }}
      onDrag={onDrag}
      onDragStart={onDragStart}
    >
      <div key="a">a</div>
    </GridLayoutV2>
  );

  const gridItem = container.querySelector(".react-grid-item");
  const gridLayout = container.querySelector(".react-grid-layout");

  // Mock getBoundingClientRect to simulate the grid being offset on the page.
  // This is crucial for testing that drag calculations use relative, not screen, coordinates.
  jest.spyOn(gridLayout, "getBoundingClientRect").mockReturnValue({
    top: GRID_TOP_OFFSET,
    left: 0,
    width: 1200,
    height: 600,
    right: 1200,
    bottom: GRID_TOP_OFFSET + 600,
    x: 0,
    y: GRID_TOP_OFFSET
  });

  jest.spyOn(gridItem, "getBoundingClientRect").mockReturnValue({
    top: GRID_TOP_OFFSET + 10, // Item is at y=10 relative to grid
    left: 10,
    width: 190,
    height: 60,
    right: 200,
    bottom: GRID_TOP_OFFSET + 70,
    x: 10,
    y: GRID_TOP_OFFSET + 10
  });

  // Start drag - click at a screen position inside the item
  const startY = GRID_TOP_OFFSET + 20;
  act(() => {
    dispatchMouseEvent(gridItem, "mousedown", {
      clientX: 20,
      clientY: startY
    });
  });

  // Move a small amount to trigger drag start
  act(() => {
    mouseMove(25, startY + 5, gridItem);
  });
  expect(onDragStart).toHaveBeenCalled();

  // Move a bit more to trigger onDrag
  act(() => {
    mouseMove(30, startY + 10, gridItem);
  });
  expect(onDrag).toHaveBeenCalled();

  // The key test: verify the item hasn't jumped.
  // With the bug, the new 'y' would be calculated from screen coordinates,
  // resulting in a large grid 'y' value (e.g., ~12).
  // Correct behavior uses parent-relative coordinates, keeping 'y' near 0.
  const lastCallArgs = onDrag.mock.calls.at(-1);
  const newItem = lastCallArgs[2]; // onDrag(layout, oldItem, newItem, ...)

  expect(newItem.y).toBeLessThan(5); // Should be near its original y=0, not jumped

  // Clean up
  act(() => {
    const mouseUpEvent = new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: 30,
      clientY: startY + 10,
      button: 0
    });
    document.dispatchEvent(mouseUpEvent);
  });
});