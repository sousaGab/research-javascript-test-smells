it("does not cause Maximum update depth exceeded when dragging in then out (#2210)", function () {
  // Arrange: Mock console.error to spy on React warnings and mock event handlers.
  const consoleError = jest
    .spyOn(console, "error")
    .mockImplementation(() => {});
  const onLayoutChange = jest.fn();
  const onDropDragOver = jest.fn(() => ({ w: 2, h: 2 }));
  const onDrag = jest.fn();
  const onDragStart = jest.fn();

  const { container } = render(
    <ReactGridLayout
      className="layout"
      cols={12}
      rowHeight={30}
      width={1200}
      isDroppable={true}
      onDropDragOver={onDropDragOver}
      onLayoutChange={onLayoutChange}
      onDrag={onDrag}
      onDragStart={onDragStart}
    >
      <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
        a
      </div>
    </ReactGridLayout>
  );
  const grid = container.querySelector(".react-grid-layout");

  // Act: Simulate dragging an external item into and over the grid.
  act(() => {
    TestUtils.Simulate.dragEnter(grid, {
      clientX: 200,
      clientY: 100
    });
    // Simulate multiple dragOver events to mimic user movement
    for (let i = 0; i < 5; i++) {
      TestUtils.Simulate.dragOver(grid, {
        currentTarget: {
          getBoundingClientRect: () => ({ left: 0, top: 0 })
        },
        clientX: 200 + i * 20,
        clientY: 100 + i * 20,
        nativeEvent: {
          target: document.createElement("div")
        }
      });
    }
  });

  // Assert: A dropping placeholder is added to the DOM, but not exposed in the layout.
  expect(container.querySelectorAll(".react-grid-item")).toHaveLength(2);
  const layoutsPassedToOnChange = onLayoutChange.mock.calls.flat(2);
  const droppingElemWasInLayout = layoutsPassedToOnChange.some(
    item => item.i === "__dropping-elem__"
  );
  expect(droppingElemWasInLayout).toBe(false);

  // Act: Simulate dragging the item out of the grid.
  act(() => {
    TestUtils.Simulate.dragLeave(grid, {
      clientX: -100,
      clientY: -100
    });
  });

  // Assert: The placeholder is removed and no infinite loop errors occurred.
  expect(container.querySelectorAll(".react-grid-item")).toHaveLength(1);

  const maxDepthErrors = consoleError.mock.calls.filter(call =>
    call[0]?.includes?.("Maximum update depth exceeded")
  );
  expect(maxDepthErrors).toHaveLength(0);
  expect(onDrag.mock.calls.length).toBeLessThan(50);

  consoleError.mockRestore();
});