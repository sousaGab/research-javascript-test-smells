it("does not cause item to jump on drag start with default positionStrategy", function () {
  // Arrange: Setup grid, mock handlers, and initial layout
  const onDrag = jest.fn();
  const onDragStart = jest.fn();
  const {
    container
  } = render( <
    GridLayoutV2 className = "layout"
    gridConfig = {
      {
        cols: 12,
        rowHeight: 30,
        margin: [10, 10]
      }
    }
    width = {
      1200
    }
    layout = {
      [{
        i: "a",
        x: 0,
        y: 0,
        w: 2,
        h: 2
      }]
    }
    dragConfig = {
      {
        enabled: true
      }
    }
    onDrag = {
      onDrag
    }
    onDragStart = {
      onDragStart
    } >
    <
    div key = "a" > a < /div> <
    /GridLayoutV2>
  );
  const gridItem = container.querySelector(".react-grid-item");
  const gridLayout = container.querySelector(".react-grid-layout");

  // Arrange: Simulate a scrolled-down page by mocking element positions.
  // This is crucial as the bug manifests when the grid's top is not 0.
  const GRID_VIEWPORT_TOP = 500;
  jest.spyOn(gridLayout, "getBoundingClientRect").mockReturnValue({
    top: GRID_VIEWPORT_TOP,
    left: 0,
    width: 1200,
    height: 600,
  });
  jest.spyOn(gridItem, "getBoundingClientRect").mockReturnValue({
    top: GRID_VIEWPORT_TOP + 10, // Item is at y=10 within the grid
    left: 10,
    width: 190,
    height: 60,
  });

  // Act: Simulate a drag operation starting inside the grid item
  const dragStartCoords = {
    clientX: 20,
    clientY: 520
  }; // 500 (grid) + 20 (in-item)
  const firstMoveCoords = {
    clientX: 25,
    clientY: 525
  };
  const secondMoveCoords = {
    clientX: 30,
    clientY: 530
  };

  act(() => {
    dispatchMouseEvent(gridItem, "mousedown", dragStartCoords);
  });
  act(() => {
    mouseMove(firstMoveCoords.clientX, firstMoveCoords.clientY, gridItem);
  });

  // Assert: Drag start event is fired
  expect(onDragStart).toHaveBeenCalled();

  // Act: Continue dragging
  act(() => {
    mouseMove(secondMoveCoords.clientX, secondMoveCoords.clientY, gridItem);
  });

  // Assert: The item's grid position is calculated relative to the grid, not the viewport.
  expect(onDrag).toHaveBeenCalled();
  const [, , newItem] = onDrag.mock.calls.pop();

  // The item should remain near its starting grid Y-coordinate (0), not jump to a
  // position calculated from the viewport Y-coordinate (e.g., 520px -> grid y=12+).
  expect(newItem.y).toBeLessThan(5);

  // Teardown: Release the mouse to end the drag
  act(() => {
    const mouseUpEvent = new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      view: window,
      button: 0,
      ...secondMoveCoords,
    });
    document.dispatchEvent(mouseUpEvent);
  });
});