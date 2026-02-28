it("does not cause item to jump on drag start with default positionStrategy", function () {
  const onDrag = jest.fn();
  const onDragStart = jest.fn();

  const GRID_WIDTH = 1200;
  const GRID_COLS = 12;
  const GRID_ROW_HEIGHT = 30;
  const GRID_MARGIN = [10, 10];
  const GRID_TOP_OFFSET = 500;
  const GRID_LEFT_OFFSET = 0;
  const ITEM_X = 0;
  const ITEM_Y = 0;
  const ITEM_W = 2;
  const ITEM_H = 2;
  const ITEM_TOP_OFFSET = GRID_TOP_OFFSET + GRID_MARGIN[1];
  const ITEM_LEFT_OFFSET = GRID_LEFT_OFFSET + GRID_MARGIN[0];
  const DRAG_START_CLIENT_X = ITEM_LEFT_OFFSET + 10;
  const DRAG_START_CLIENT_Y = ITEM_TOP_OFFSET + 10;
  const FIRST_MOVE_CLIENT_X = DRAG_START_CLIENT_X + 5;
  const FIRST_MOVE_CLIENT_Y = DRAG_START_CLIENT_Y + 5;
  const SECOND_MOVE_CLIENT_X = FIRST_MOVE_CLIENT_X + 5;
  const SECOND_MOVE_CLIENT_Y = FIRST_MOVE_CLIENT_Y + 5;
  const MAX_ALLOWED_Y_POSITION = 5;

  const { container } = render(
    <GridLayoutV2
      className="layout"
      gridConfig={{ cols: GRID_COLS, rowHeight: GRID_ROW_HEIGHT, margin: GRID_MARGIN }}
      width={GRID_WIDTH}
      layout={[{ i: "a", x: ITEM_X, y: ITEM_Y, w: ITEM_W, h: ITEM_H }]}
      dragConfig={{ enabled: true }}
      onDrag={onDrag}
      onDragStart={onDragStart}
    >
      <div key="a">a</div>
    </GridLayoutV2>
  );

  const gridItem = container.querySelector(".react-grid-item");
  const gridLayout = container.querySelector(".react-grid-layout");

  const originalGetBoundingClientRect = gridLayout.getBoundingClientRect.bind(gridLayout);
  gridLayout.getBoundingClientRect = () => ({
    ...originalGetBoundingClientRect(),
    top: GRID_TOP_OFFSET,
    left: GRID_LEFT_OFFSET,
    width: GRID_WIDTH,
    height: 600
  });

  const originalItemGetBoundingClientRect = gridItem.getBoundingClientRect.bind(gridItem);
  gridItem.getBoundingClientRect = () => ({
    ...originalItemGetBoundingClientRect(),
    top: ITEM_TOP_OFFSET,
    left: ITEM_LEFT_OFFSET,
    width: 190,
    height: 60
  });

  act(() => {
    dispatchMouseEvent(gridItem, "mousedown", {
      clientX: DRAG_START_CLIENT_X,
      clientY: DRAG_START_CLIENT_Y
    });
  });

  act(() => {
    mouseMove(FIRST_MOVE_CLIENT_X, FIRST_MOVE_CLIENT_Y, gridItem);
  });

  expect(onDragStart).toHaveBeenCalled();

  act(() => {
    mouseMove(SECOND_MOVE_CLIENT_X, SECOND_MOVE_CLIENT_Y, gridItem);
  });

  expect(onDrag).toHaveBeenCalled();

  const dragCall = onDrag.mock.calls[onDrag.mock.calls.length - 1];
  const newItem = dragCall[2];

  expect(newItem.y).toBeLessThan(MAX_ALLOWED_Y_POSITION);

  act(() => {
    const mouseUpEvent = new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: SECOND_MOVE_CLIENT_X,
      clientY: SECOND_MOVE_CLIENT_Y,
      button: 0
    });
    document.dispatchEvent(mouseUpEvent);
  });
});