it("calculates drag position relative to the grid, not the viewport", () => {
    // Arrange
    const onDrag = jest.fn();
    const onDragStart = jest.fn();

    const GRID_TOP_OFFSET = 500;
    const ITEM_MARGIN = 10;

    const ITEM_INITIAL_X_PX = ITEM_MARGIN;
    const ITEM_INITIAL_Y_PX = ITEM_MARGIN;

    const ITEM_ABSOLUTE_TOP = GRID_TOP_OFFSET + ITEM_INITIAL_Y_PX;

    const MOUSE_DOWN_COORDS = { clientX: 20, clientY: ITEM_ABSOLUTE_TOP + 10 };
    const MOUSE_MOVE_1_COORDS = { clientX: 25, clientY: ITEM_ABSOLUTE_TOP + 15 };
    const MOUSE_MOVE_2_COORDS = { clientX: 30, clientY: ITEM_ABSOLUTE_TOP + 20 };

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

    // Mock getBoundingClientRect to simulate the grid being offset from the viewport top.
    // This is crucial as JSDOM returns all zeros, hiding bugs related to page scroll.
    jest.spyOn(gridLayout, "getBoundingClientRect").mockReturnValue({
      top: GRID_TOP_OFFSET,
      left: 0,
      width: 1200,
      height: 600,
      x: 0,
      y: GRID_TOP_OFFSET,
      right: 1200,
      bottom: 600 + GRID_TOP_OFFSET
    });

    jest.spyOn(gridItem, "getBoundingClientRect").mockReturnValue({
      top: ITEM_ABSOLUTE_TOP,
      left: ITEM_INITIAL_X_PX,
      width: 190,
      height: 60,
      x: ITEM_INITIAL_X_PX,
      y: ITEM_ABSOLUTE_TOP,
      right: 190 + ITEM_INITIAL_X_PX,
      bottom: 60 + ITEM_ABSOLUTE_TOP
    });

    // Act
    act(() => {
      dispatchMouseEvent(gridItem, "mousedown", MOUSE_DOWN_COORDS);
    });
    act(() => {
      mouseMove(MOUSE_MOVE_1_COORDS.clientX, MOUSE_MOVE_1_COORDS.clientY, gridItem);
    });
    act(() => {
      mouseMove(MOUSE_MOVE_2_COORDS.clientX, MOUSE_MOVE_2_COORDS.clientY, gridItem);
    });

    // Assert
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDrag).toHaveBeenCalled();

    const lastOnDragCallArgs = onDrag.mock.calls.at(-1);
    const draggedItemState = lastOnDragCallArgs[2];

    // The item's y-position should not jump due to the grid's page offset.
    // A large value would indicate incorrect use of screen coordinates.
    const MAX_ACCEPTABLE_Y_JUMP = 5;
    expect(draggedItemState.y).toBeLessThan(MAX_ACCEPTABLE_Y_JUMP);

    // Teardown
    act(() => {
      const mouseUpEvent = new MouseEvent("mouseup", {
        bubbles: true,
        cancelable: true,
        view: window,
        ...MOUSE_MOVE_2_COORDS,
        button: 0
      });
      document.dispatchEvent(mouseUpEvent);
    });
});