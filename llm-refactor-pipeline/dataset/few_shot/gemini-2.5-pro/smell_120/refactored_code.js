it("does not cause item to jump on drag start with default positionStrategy", function () {
  const onDrag = jest.fn();
  const onDragStart = jest.fn();
  const GRID_PAGE_OFFSET_Y = 500;
  const ITEM_INITIAL_PIXEL_POS = { x: 10, y: 10 }; // Based on margin=[10,10]

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

  const mockElementPosition = (element, overrides) => {
    const original = element.getBoundingClientRect.bind(element);
    element.getBoundingClientRect = () => ({ ...original(), ...overrides });
  };

  mockElementPosition(gridLayout, { top: GRID_PAGE_OFFSET_Y });
  mockElementPosition(gridItem, {
    top: GRID_PAGE_OFFSET_Y + ITEM_INITIAL_PIXEL_POS.y,
    left: ITEM_INITIAL_PIXEL_POS.x
  });

  const dragStartPoint = {
    clientX: ITEM_INITIAL_PIXEL_POS.x + 10,
    clientY: GRID_PAGE_OFFSET_Y + ITEM_INITIAL_PIXEL_POS.y + 10
  };
  const dragEndPoint = {
    clientX: dragStartPoint.clientX + 10,
    clientY: dragStartPoint.clientY + 10
  };

  act(() => {
    dispatchMouseEvent(gridItem, "mousedown", dragStartPoint);
  });
  act(() => {
    mouseMove(dragStartPoint.clientX + 5, dragStartPoint.clientY + 5, gridItem);
    mouseMove(dragEndPoint.clientX, dragEndPoint.clientY, gridItem);
  });

  expect(onDragStart).toHaveBeenCalled();
  expect(onDrag).toHaveBeenCalled();

  const [, , newItem] = onDrag.mock.lastCall;
  expect(newItem.y).toBeLessThan(5);

  act(() => {
    const mouseUpEvent = new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      view: window,
      ...dragEndPoint,
      button: 0
    });
    document.dispatchEvent(mouseUpEvent);
  });
});