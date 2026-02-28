it("does not cause item to jump on drag start with default positionStrategy", function () {
  const onDrag = jest.fn();
  const onDragStart = jest.fn();

  const GRID_CONFIG = { cols: 12, rowHeight: 30, margin: [10, 10] };
  const GRID_WIDTH = 1200;
  const ITEM_LAYOUT = [{ i: "a", x: 0, y: 0, w: 2, h: 2 }];
  const GRID_TOP = 500;
  const GRID_LEFT = 0;
  const GRID_HEIGHT = 600;
  const GRID_ITEM_TOP = 510;
  const GRID_ITEM_LEFT = 10;
  const GRID_ITEM_WIDTH = 190;
  const GRID_ITEM_HEIGHT = 60;

  const { container } = render(
    <GridLayoutV2
      className="layout"
      gridConfig={GRID_CONFIG}
      width={GRID_WIDTH}
      layout={ITEM_LAYOUT}
      dragConfig={{ enabled: true }}
      onDrag={onDrag}
      onDragStart={onDragStart}
    >
      <div key="a">a</div>
    </GridLayoutV2>
  );

  const gridItem = container.querySelector(".react-grid-item");
  const gridLayout = container.querySelector(".react-grid-layout");

  const originalGridRect = gridLayout.getBoundingClientRect.bind(gridLayout);
  gridLayout.getBoundingClientRect = () => ({
    ...originalGridRect(),
    top: GRID_TOP,
    left: GRID_LEFT,
    width: GRID_WIDTH,
    height: GRID_HEIGHT
  });

  const originalItemRect = gridItem.getBoundingClientRect.bind(gridItem);
  gridItem.getBoundingClientRect = () => ({
    ...originalItemRect(),
    top: GRID_ITEM_TOP,
    left: GRID_ITEM_LEFT,
    width: GRID_ITEM_WIDTH,
    height: GRID_ITEM_HEIGHT
  });

  act(() => {
    dispatchMouseEvent(gridItem, "mousedown", {
      clientX: GRID_ITEM_LEFT + 10,
      clientY: GRID_TOP + 20
    });
  });

  act(() => {
    mouseMove(GRID_ITEM_LEFT + 15, GRID_TOP + 25, gridItem);
  });

  expect(onDragStart).toHaveBeenCalled();

  act(() => {
    mouseMove(GRID_ITEM_LEFT + 20, GRID_TOP + 30, gridItem);
  });

  expect(onDrag).toHaveBeenCalled();

  const dragCall = onDrag.mock.calls[onDrag.mock.calls.length - 1];
  const newItem = dragCall[2];

  expect(newItem.y).toBeLessThan(5);

  act(() => {
    const mouseUpEvent = new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: GRID_ITEM_LEFT + 20,
      clientY: GRID_TOP + 30,
      button: 0
    });
    document.dispatchEvent(mouseUpEvent);
  });
});