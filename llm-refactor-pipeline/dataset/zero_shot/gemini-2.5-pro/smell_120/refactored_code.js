it("does not cause item to jump on drag start with default positionStrategy", function () {
  const mockBoundingClientRect = (element, rect) => {
    const originalGetBoundingClientRect = element.getBoundingClientRect.bind(element);
    element.getBoundingClientRect = () => ({
      ...originalGetBoundingClientRect(),
      ...rect
    });
  };

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

  // Simulate the grid being scrolled 500px down the page. This is crucial
  // to reproduce the bug where item position is miscalculated relative to the
  // screen instead of the grid container.
  const GRID_TOP_OFFSET = 500;
  mockBoundingClientRect(gridLayout, { top: GRID_TOP_OFFSET });
  mockBoundingClientRect(gridItem, { top: GRID_TOP_OFFSET + 10, left: 10 });

  // Simulate a drag operation starting inside the item
  const startY = GRID_TOP_OFFSET + 20;
  act(() => {
    dispatchMouseEvent(gridItem, "mousedown", { clientX: 20, clientY: startY });
  });
  act(() => {
    mouseMove(25, startY + 5, gridItem); // Move to trigger drag start
  });
  expect(onDragStart).toHaveBeenCalled();

  act(() => {
    mouseMove(30, startY + 10, gridItem); // Move more to trigger onDrag
  });
  expect(onDrag).toHaveBeenCalled();

  // The bug would cause newItem.y to be calculated from screen coordinates,
  // resulting in a large value (~12). Correct behavior uses parent-relative
  // coordinates, keeping y close to its original value of 0.
  const [, , newItem] = onDrag.mock.lastCall;
  expect(newItem.y).toBeLessThan(5); // Should remain near the top, not jump

  // Cleanup
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