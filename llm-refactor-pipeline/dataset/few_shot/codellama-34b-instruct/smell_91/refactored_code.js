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

  // Step 1: Drag into the grid (creates dropping placeholder)
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

  // Verify the dropping placeholder is rendered in the DOM (internal state)
  // The grid has: 1 original item, 1 dropping item, and 1 active placeholder = 3
  expect(
    container.querySelectorAll(".react-grid-item").length
  ).toBeGreaterThanOrEqual(2);

  // But it should NOT be in onLayoutChange (public state) - this is expected behavior
  // since #2210 fix: dropping placeholder is transient internal state
  let layoutCalls = onLayoutChange.mock.calls;
  let hasDroppedItemInPublicLayout = layoutCalls.some(call =>
    call[0].some(item => item.i === "__dropping-elem__")
  );
  expect(hasDroppedItemInPublicLayout).toBe(false);

  // Record how many times onDrag was called
  const _dragCallsBefore = onDrag.mock.calls.length;

  // Step 2: Move the item around inside the grid (multiple moves)
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

  // Step 3: Drag leave (move outside the grid without releasing)
  // This is where the infinite loop would occur in #2210
  act(() => {
    TestUtils.Simulate.dragLeave(grid, {
      clientX: -100,
      clientY: -100
    });
  });

  // If we get here without timing out, the fix is working
  // The dropping placeholder should have been removed from internal state (only 1 item now)
  expect(container.querySelectorAll(".react-grid-item").length).toBe(1);

  // And still should not be in public layout
  layoutCalls = onLayoutChange.mock.calls;
  const lastLayout = layoutCalls[layoutCalls.length - 1]?.[0] || [];
  hasDroppedItemInPublicLayout = lastLayout.some(
    item => item.i === "__dropping-elem__"
  );
  expect(hasDroppedItemInPublicLayout).toBe(false);

  // Verify onDrag wasn't called excessively (would indicate infinite loop)
  // We expect 5 drag calls from step 2, plus maybe a few more, but not 50+
  const totalDragCalls = onDrag.mock.calls.length;
  expect(totalDragCalls).toBeLessThan(50);

  // Verify no "Maximum update depth exceeded" errors
  const maxDepthErrors = consoleError.mock.calls.filter(call =>
    call[0]?.includes?.("Maximum update depth exceeded")
  );
  expect(maxDepthErrors).toHaveLength(0);

  consoleError.mockRestore();
});