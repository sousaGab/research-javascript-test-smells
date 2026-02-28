it("calculates drag position relative to the grid, not the page, preventing jumps on drag start", function () {
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

  // Simulate the grid being scrolled 500px down the page.
  const GRID_PAGE_Y_OFFSET = 500;
  const ITEM_GRID_RELATIVE_Y = 10; // From gridConfig.margin
  const ITEM_PAGE_Y = GRID_PAGE_Y_OFFSET + ITEM_GRID_RELATIVE_Y;

  // Mock getBoundingClientRect to reflect the scrolled position, which jsdom doesn't do.
  jest.spyOn(gridLayout, "getBoundingClientRect").mockReturnValue({
    top: GRID_PAGE_Y_OFFSET,
    left: 0,
    width: 1200,
    height: 600
  });
  jest.spyOn(gridItem, "getBoundingClientRect").mockReturnValue({
    top: ITEM_PAGE_Y,
    left: 10, // from gridConfig.margin
    width: 190,
    height: 60
  });

  // Simulate a drag starting 10px inside the item.
  const dragStartPoint = { clientX: 20, clientY: ITEM_PAGE_Y + 10 };
  const firstMovePoint = { clientX: 25, clientY: dragStartPoint.clientY + 5 };
  const secondMovePoint = { clientX: 30, clientY: dragStartPoint.clientY + 10 };

  act(() => {
    dispatchMouseEvent(gridItem, "mousedown", dragStartPoint);
  });
  act(() => {
    mouseMove(firstMovePoint.clientX, firstMovePoint.clientY, gridItem);
  });

  expect(onDragStart).toHaveBeenCalled();

  act(() => {
    mouseMove(secondMovePoint.clientX, secondMovePoint.clientY, gridItem);
  });

  expect(onDrag).toHaveBeenCalled();

  const lastDragArgs = onDrag.mock.calls.at(-1);
  const draggedItem = lastDragArgs[2];

  // The item's new grid 'y' position should remain close to its original 'y' of 0.
  // A bug would incorrectly calculate 'y' from the page coordinate (e.g., 520px),
  // causing the item to jump to a high grid row (y > 10).
  const MAX_ACCEPTABLE_Y_POSITION = 5;
  expect(draggedItem.y).toBeLessThan(MAX_ACCEPTABLE_Y_POSITION);

  act(() => {
    const mouseUpEvent = new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: secondMovePoint.clientX,
      clientY: secondMovePoint.clientY,
      button: 0
    });
    document.dispatchEvent(mouseUpEvent);
  });
});