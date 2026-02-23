it("does not cause item to jump on drag start with default positionStrategy", function () {
  const onDrag = jest.fn();
  const onDragStart = jest.fn();

  // Arrange: Set up a grid scrolled down the page to test coordinate calculations.
  const GRID_OFFSET_TOP = 500;
  const ITEM_MARGIN = 10;
  const ITEM_INITIAL_TOP_ON_PAGE = GRID_OFFSET_TOP + ITEM_MARGIN;
  const ITEM_INITIAL_LEFT_ON_PAGE = ITEM_MARGIN;

  const { container } = render(
    <GridLayoutV2
      className="layout"
      gridConfig={{ cols: 12, rowHeight: 30, margin: [ITEM_MARGIN, ITEM_MARGIN] }}
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

  // Mocking getBoundingClientRect is necessary because jsdom returns all zeros,
  // which would hide bugs related to absolute vs. relative page positioning.
  const originalGetBoundingClientRect = gridLayout.getBoundingClientRect.bind(gridLayout);
  gridLayout.getBoundingClientRect = () => ({
    ...originalGetBoundingClientRect(),
    top: GRID_OFFSET_TOP,
    left: 0
  });

  const originalItemGetBoundingClientRect = gridItem.getBoundingClientRect.bind(gridItem);
  gridItem.getBoundingClientRect = () => ({
    ...originalItemGetBoundingClientRect(),
    top: ITEM_INITIAL_TOP_ON_PAGE,
    left: ITEM_INITIAL_LEFT_ON_PAGE
  });

  const mouseDownClientX = ITEM_INITIAL_LEFT_ON_PAGE + 10;
  const mouseDownClientY = ITEM_INITIAL_TOP_ON_PAGE + 10;

  // Act: Simulate a drag operation.
  act(() => {
    dispatchMouseEvent(gridItem, "mousedown", {
      clientX: mouseDownClientX,
      clientY: mouseDownClientY
    });
  });

  act(() => {
    mouseMove(mouseDownClientX + 5, mouseDownClientY + 5, gridItem);
  });

  expect(onDragStart).toHaveBeenCalled();

  act(() => {
    mouseMove(mouseDownClientX + 10, mouseDownClientY + 10, gridItem);
  });

  // Assert: The item's grid position should not have jumped due to page offset.
  expect(onDrag).toHaveBeenCalled();

  const lastOnDragCall = onDrag.mock.calls.slice(-1)[0];
  const newItem = lastOnDragCall[2];

  // The item's grid Y position should remain close to its original position (0)
  // and not jump to a large value calculated from the page's Y coordinate.
  expect(newItem.y).toBeLessThan(5);

  // Cleanup
  act(() => {
    const mouseUpEvent = new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: mouseDownClientX + 10,
      clientY: mouseDownClientY + 10,
      button: 0
    });
    document.dispatchEvent(mouseUpEvent);
  });
});