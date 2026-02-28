it("does not cause item to jump on drag start with default positionStrategy", function () {
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

  mockElementPosition(gridLayout, { top: 500, left: 0, width: 1200, height: 600 });
  mockElementPosition(gridItem, { top: 510, left: 10, width: 190, height: 60 });

  startDragAt(gridItem, { x: 20, y: 520 });
  moveMouseTo(gridItem, { x: 25, y: 525 });

  expect(onDragStart).toHaveBeenCalled();

  moveMouseTo(gridItem, { x: 30, y: 530 });

  expect(onDrag).toHaveBeenCalled();

  const draggedItem = getLastDraggedItem(onDrag);
  expect(draggedItem.y).toBeLessThan(5);

  endDragAt({ x: 30, y: 530 });
});

function mockElementPosition(element, { top, left, width, height }) {
  const originalGetBoundingClientRect = element.getBoundingClientRect.bind(element);
  element.getBoundingClientRect = () => ({
    ...originalGetBoundingClientRect(),
    top,
    left,
    width,
    height
  });
}

function startDragAt(element, { x, y }) {
  act(() => {
    dispatchMouseEvent(element, "mousedown", { clientX: x, clientY: y });
  });
}

function moveMouseTo(element, { x, y }) {
  act(() => {
    mouseMove(x, y, element);
  });
}

function getLastDraggedItem(onDragMock) {
  const dragCall = onDragMock.mock.calls[onDragMock.mock.calls.length - 1];
  return dragCall[2];
}

function endDragAt({ x, y }) {
  act(() => {
    const mouseUpEvent = new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: x,
      clientY: y,
      button: 0
    });
    document.dispatchEvent(mouseUpEvent);
  });
}