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

  mockBoundingClientRect(gridLayout, { top: 500, left: 0, width: 1200, height: 600 });
  mockBoundingClientRect(gridItem, { top: 510, left: 10, width: 190, height: 60 });

  simulateDragSequence(gridItem, [
    { type: "mousedown", clientX: 20, clientY: 520 },
    { type: "mousemove", clientX: 25, clientY: 525 },
    { type: "mousemove", clientX: 30, clientY: 530 },
    { type: "mouseup", clientX: 30, clientY: 530 }
  ]);

  expect(onDragStart).toHaveBeenCalled();
  expect(onDrag).toHaveBeenCalled();

  const lastDragCall = onDrag.mock.calls[onDrag.mock.calls.length - 1];
  const newItem = lastDragCall[2];
  
  expect(newItem.y).toBeLessThan(5);
});

function mockBoundingClientRect(element, overrides) {
  const original = element.getBoundingClientRect.bind(element);
  element.getBoundingClientRect = () => ({ ...original(), ...overrides });
}

function simulateDragSequence(element, events) {
  events.forEach(({ type, clientX, clientY }) => {
    act(() => {
      if (type === "mousedown") {
        dispatchMouseEvent(element, type, { clientX, clientY });
      } else if (type === "mousemove") {
        mouseMove(clientX, clientY, element);
      } else if (type === "mouseup") {
        const mouseUpEvent = new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX,
          clientY,
          button: 0
        });
        document.dispatchEvent(mouseUpEvent);
      }
    });
  });
}