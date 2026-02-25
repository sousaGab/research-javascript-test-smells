it("does not cause Maximum update depth exceeded when dragging in then out (#2210)", function () {
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

  expect(
    container.querySelectorAll(".react-grid-item").length
  ).toBeGreaterThanOrEqual(2);

  let layoutCalls = onLayoutChange.mock.calls;
  let hasDroppedItemInPublicLayout = layoutCalls.some(call =>
    call[0].some(item => item.i === "__dropping-elem__")
  );
  expect(hasDroppedItemInPublicLayout).toBe(false);

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

  act(() => {
    TestUtils.Simulate.dragLeave(grid, {
      clientX: -100,
      clientY: -100
    });
  });

  expect(container.querySelectorAll(".react-grid-item").length).toBe(1);

  layoutCalls = onLayoutChange.mock.calls;
  const lastLayout = layoutCalls[layoutCalls.length - 1]?.[0] || [];
  hasDroppedItemInPublicLayout = lastLayout.some(
    item => item.i === "__dropping-elem__"
  );
  expect(hasDroppedItemInPublicLayout).toBe(false);

  const totalDragCalls = onDrag.mock.calls.length;
  expect(totalDragCalls).toBeLessThan(50);

  const maxDepthErrors = consoleError.mock.calls.filter(call =>
    call[0]?.includes?.("Maximum update depth exceeded")
  );
  expect(maxDepthErrors).toHaveLength(0);

  consoleError.mockRestore();
});