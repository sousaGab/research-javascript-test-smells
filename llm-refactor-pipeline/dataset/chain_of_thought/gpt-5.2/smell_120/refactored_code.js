// Your COMPLETE refactored test code here
it("does not cause item to jump on drag start with default positionStrategy", function () {
  const onDrag = jest.fn();
  const onDragStart = jest.fn();

  const GRID_TOP = 500;
  const GRID_LEFT = 0;
  const GRID_WIDTH = 1200;
  const GRID_HEIGHT = 600;

  const ITEM_TOP = GRID_TOP + 10;
  const ITEM_LEFT = 10;
  const ITEM_WIDTH = 190;
  const ITEM_HEIGHT = 60;

  const MOUSE_DOWN = { x: 20, y: 520 };
  const MOVE_1 = { x: 25, y: 525 };
  const MOVE_2 = { x: 30, y: 530 };

  const renderGrid = () =>
    render(
      <GridLayoutV2
        className="layout"
        gridConfig={{ cols: 12, rowHeight: 30, margin: [10, 10] }}
        width={GRID_WIDTH}
        layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
        dragConfig={{ enabled: true }}
        onDrag={onDrag}
        onDragStart={onDragStart}
      >
        <div key="a">a</div>
      </GridLayoutV2>
    );

  const mockRect = (el, rect) => {
    const original = el.getBoundingClientRect.bind(el);
    el.getBoundingClientRect = () => ({
      ...original(),
      ...rect
    });
  };

  const mouseDown = (el, { x, y }) =>
    act(() => {
      dispatchMouseEvent(el, "mousedown", { clientX: x, clientY: y });
    });

  const moveMouse = ({ x, y }, target) =>
    act(() => {
      mouseMove(x, y, target);
    });

  const mouseUp = ({ x, y }) =>
    act(() => {
      document.dispatchEvent(
        new MouseEvent("mouseup", {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: x,
          clientY: y,
          button: 0
        })
      );
    });

  const lastDraggedItemFrom = (dragMock) => {
    const lastCall = dragMock.mock.calls[dragMock.mock.calls.length - 1];
    return lastCall[2];
  };

  const { container } = renderGrid();

  const gridItem = container.querySelector(".react-grid-item");
  const gridLayout = container.querySelector(".react-grid-layout");

  mockRect(gridLayout, {
    top: GRID_TOP,
    left: GRID_LEFT,
    width: GRID_WIDTH,
    height: GRID_HEIGHT
  });

  mockRect(gridItem, {
    top: ITEM_TOP,
    left: ITEM_LEFT,
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT
  });

  mouseDown(gridItem, MOUSE_DOWN);
  moveMouse(MOVE_1, gridItem);

  expect(onDragStart).toHaveBeenCalled();

  moveMouse(MOVE_2, gridItem);

  expect(onDrag).toHaveBeenCalled();

  const newItem = lastDraggedItemFrom(onDrag);
  expect(newItem.y).toBeLessThan(5);

  mouseUp(MOVE_2);
});