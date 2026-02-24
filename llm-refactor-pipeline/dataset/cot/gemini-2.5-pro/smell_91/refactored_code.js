it("should not cause an infinite update loop when dragging an item in and then out of the grid", function () {
  // Arrange
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

  // Act: Drag an external item into the grid
  act(() => {
    TestUtils.Simulate.dragEnter(grid, {
      clientX: 200,
      clientY: 100
    });
  });
  act(() => {
    TestUtils.Simulate.dragOver(grid, {
      currentTarget: {
        getBoundingClientRect: () => ({ left: 0, top: 0 })
      },
      clientX: 200,
      clientY: 100,
      nativeEvent: {
        target: document.createElement("div")
      }
    });
  });

  // Assert: A dropping placeholder is added to the DOM but not the public layout
  expect(
    container.querySelectorAll(".react-grid-item").length
  ).toBeGreaterThanOrEqual(2);

  const hasDroppedItemInitially = onLayoutChange.mock.calls.some(call =>
    call[0].some(item => item.i === "__dropping-elem__")
  );
  expect(hasDroppedItemInitially).toBe(false);

  // Act: Drag the item around within the grid
  for (let i = 0; i < 5; i++) {
    act(() => {
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
    });
  }

  // Act: Drag the item out of the grid
  act(() => {
    TestUtils.Simulate.dragLeave(grid, {
      clientX: -100,
      clientY: -100
    });
  });

  // Assert: The placeholder is removed and no errors occurred
  expect(container.querySelectorAll(".react-grid-item").length).toBe(1);

  const finalLayoutCalls = onLayoutChange.mock.calls;
  const lastLayout =
    finalLayoutCalls[finalLayoutCalls.length - 1]?.[0] || [];
  const hasDroppedItemInFinalLayout = lastLayout.some(
    item => item.i === "__dropping-elem__"
  );
  expect(hasDroppedItemInFinalLayout).toBe(false);

  expect(onDrag.mock.calls.length).toBeLessThan(50);

  const maxDepthErrors = consoleError.mock.calls.filter(call =>
    call[0]?.includes?.("Maximum update depth exceeded")
  );
  expect(maxDepthErrors).toHaveLength(0);

  consoleError.mockRestore();
});