it("does not cause item to jump on drag start with default positionStrategy", function () {
  // Helper to render the grid and mock its position to simulate being scrolled down the page.
  const setupGridWithOffset = (gridTopOffset = 0) => {
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

    const gridLayout = container.querySelector(".react-grid-layout");
    const gridItem = container.querySelector(".react-grid-item");

    // In a real browser, the grid's position depends on page scroll. We mock this.
    const originalGetBoundingClientRect = gridLayout.getBoundingClientRect;
    gridLayout.getBoundingClientRect = () => ({
      ...originalGetBoundingClientRect.call(gridLayout),
      top: gridTopOffset,
      left: 0,
      width: 1200,
      height: 600
    });

    // The item's position is relative to the grid.
    const itemRelativeTop = 10; // from margin[1]
    const itemRelativeLeft = 10; // from margin[0]
    const originalItemGetBoundingClientRect = gridItem.getBoundingClientRect;
    gridItem.getBoundingClientRect = () => ({
      ...originalItemGetBoundingClientRect.call(gridItem),
      top: gridTopOffset + itemRelativeTop,
      left: itemRelativeLeft,
      width: 190,
      height: 60
    });

    return { gridItem, onDrag, onDragStart };
  };

  // Helper to simulate a drag-and-drop user interaction.
  const simulateDrag = (element, from, to) => {
    act(() => {
      dispatchMouseEvent(element, "mousedown", {
        clientX: from.x,
        clientY: from.y
      });
    });
    // A small initial move to trigger onDragStart
    act(() => {
      mouseMove(from.x + 5, from.y + 5, element);
    });
    // The main move to trigger onDrag
    act(() => {
      mouseMove(to.x, to.y, element);
    });
  };

  // Arrange: Set up a grid that is scrolled 500px down the page.
  const GRID_OFFSET_Y = 500;
  const { gridItem, onDrag, onDragStart } = setupGridWithOffset(GRID_OFFSET_Y);

  // Define drag coordinates relative to the screen, inside the item.
  const dragStartPoint = { x: 20, y: GRID_OFFSET_Y + 20 };
  const dragEndPoint = { x: 30, y: GRID_OFFSET_Y + 30 };

  // Act: Simulate a short drag.
  simulateDrag(gridItem, dragStartPoint, dragEndPoint);

  // Assert: Callbacks were fired and the item's grid position is correct.
  expect(onDragStart).toHaveBeenCalled();
  expect(onDrag).toHaveBeenCalled();

  // The key assertion: The item's new 'y' coordinate should be near its origin (0),
  // not a large value calculated from the screen's Y-coordinate.
  const lastOnDragCall = onDrag.mock.calls.slice(-1)[0];
  const [, , draggedItem] = lastOnDragCall;

  // Allow a small tolerance for movement, but it shouldn't jump to y=12+.
  expect(draggedItem.y).toBeLessThan(5);

  // Cleanup: Simulate mouse up to end the drag sequence.
  act(() => {
    const mouseUpEvent = new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: dragEndPoint.x,
      clientY: dragEndPoint.y,
      button: 0
    });
    document.dispatchEvent(mouseUpEvent);
  });
});