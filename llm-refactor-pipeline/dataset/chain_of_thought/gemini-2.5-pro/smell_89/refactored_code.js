it("should re-observe the component element after replacing the measurement placeholder", async function () {
  const originalOffsetWidth = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetWidth"
  );

  try {
    global.__resizeObservers__ = [];

    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      get: () => 800
    });

    const { container } = render(<BasicLayout measureBeforeMount={true} />);

    const gridLayout = container.querySelector(".react-grid-layout");
    expect(gridLayout).toBeInTheDocument();

    const activeObservers = global.__resizeObservers__.filter(
      obs => obs.observedElements.length > 0
    );
    expect(activeObservers.length).toBeGreaterThan(0);

    const observedElement = activeObservers[0].observedElements[0];
    expect(document.body.contains(observedElement)).toBe(true);

    act(() => {
      global.triggerResize(1000);
    });

    expect(
      container.querySelector(".react-grid-layout")
    ).toBeInTheDocument();
  } finally {
    if (originalOffsetWidth) {
      Object.defineProperty(
        HTMLElement.prototype,
        "offsetWidth",
        originalOffsetWidth
      );
    }
  }
});